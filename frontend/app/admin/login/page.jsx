"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  KeyRound,
  Copy,
  Check,
  Download,
  ArrowLeft,
  Info,
} from "lucide-react";
import { useAuth } from "@/components/admin/AuthProvider";
import { authApi } from "@/lib/adminApi";

// Dashboard sign-in with required two-factor authentication.
//   1. "password" — email + password
//   2a. "verify"  — 6-digit code from Google Authenticator (or a backup code)
//   2b. "setup"   — first time: scan the QR code, enter the first code
//   3. "backup"   — after setup: save the one-time backup codes, then continue
//   (+) "backupUsed" — signed in with a backup code: show how many are left

const inputBase =
  "w-full py-3 rounded-lg border border-slate-300 outline-none focus:border-brand text-sm text-slate-800 placeholder-slate-400";

function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-brand">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

function PrimaryButton({ loading, children, ...rest }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

/** 6-digit code input: numbers only, phone keypad, browser one-time-code autofill. */
function CodeInput({ value, onChange, autoFocus = true }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]*"
      maxLength={6}
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      placeholder="123456"
      aria-label="6-digit code"
      className={`${inputBase} px-3 text-center text-2xl font-bold tracking-[0.5em] font-mono`}
    />
  );
}

export default function LoginPage() {
  const { login, completeLogin, token, hydrated } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [challenge, setChallenge] = useState(null); // 2FA challenge token
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);

  const [setupData, setSetupData] = useState(null); // { otpauthUrl, secret, account }
  const [qr, setQr] = useState("");
  const [keyCopied, setKeyCopied] = useState(false);

  const [backupCodes, setBackupCodes] = useState([]);
  const [savedCodes, setSavedCodes] = useState(false);
  const [codesCopied, setCodesCopied] = useState(false);
  const [backupLeft, setBackupLeft] = useState(null);
  const pendingSession = useRef(null); // held until backup codes are acknowledged

  // Already signed in → go to the dashboard.
  useEffect(() => {
    if (hydrated && token) router.replace("/admin");
  }, [hydrated, token, router]);

  const restart = (message = "") => {
    setStep("password");
    setChallenge(null);
    setCode("");
    setUseBackup(false);
    setSetupData(null);
    setQr("");
    setPassword("");
    setError(message);
  };

  // The challenge lasts 5 minutes; if it expired, go back to the password step.
  const handleStepError = (err) => {
    const codeName = err?.body?.error?.code;
    if (codeName === "CHALLENGE_EXPIRED" || codeName === "INVALID_CHALLENGE") {
      restart(err.message || "Please sign in again.");
    } else {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  const finish = (session) => {
    completeLogin(session.token, session.user);
    router.replace("/admin");
  };

  // ── Step 1: password ──
  const onPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      if (data?.twoFactor === "verify") {
        setChallenge(data.challengeToken);
        setStep("verify");
      } else if (data?.twoFactor === "setup") {
        setChallenge(data.challengeToken);
        setStep("setup");
        await startSetup(data.challengeToken);
      } else {
        router.replace("/admin"); // server without 2FA: already signed in
      }
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2a: code ──
  const onVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.twoFactorVerify(challenge, code.trim());
      const data = res?.data || res;
      if (data.usedBackupCode) {
        pendingSession.current = data;
        setBackupLeft(data.backupCodesRemaining ?? 0);
        setStep("backupUsed");
      } else {
        finish(data);
      }
    } catch (err) {
      setCode("");
      handleStepError(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2b: first-time setup ──
  async function startSetup(ch) {
    setError("");
    try {
      const res = await authApi.twoFactorSetup(ch);
      const d = res?.data || res;
      setSetupData(d);
      setQr(await QRCode.toDataURL(d.otpauthUrl, { width: 220, margin: 1 }));
    } catch (err) {
      handleStepError(err);
    }
  }

  const onEnable = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.twoFactorEnable(challenge, code);
      const data = res?.data || res;
      pendingSession.current = data;
      setBackupCodes(data.backupCodes || []);
      setStep("backup");
    } catch (err) {
      setCode("");
      handleStepError(err);
    } finally {
      setLoading(false);
    }
  };

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(setupData?.secret || "");
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  // ── Step 3: backup codes ──
  const codesText = () =>
    [
      "GATD Dashboard — two-factor backup codes",
      `Account: ${setupData?.account || email}`,
      "Each code works once. Keep them somewhere safe.",
      "",
      ...backupCodes,
    ].join("\n");

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(codesText());
      setCodesCopied(true);
      setTimeout(() => setCodesCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const downloadCodes = () => {
    const url = URL.createObjectURL(new Blob([codesText()], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "gatd-dashboard-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const secretGrouped = (setupData?.secret || "").replace(/(.{4})/g, "$1 ").trim();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className={`w-full ${step === "setup" || step === "backup" ? "max-w-lg" : "max-w-md"}`}>
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-black text-lg">
            G
          </div>
          <span className="text-xl font-bold text-slate-800">
            GATD <span className="text-slate-400 font-medium">Admin</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {/* ── Step 1: password ─────────────────────────────────────────── */}
          {step === "password" && (
            <>
              <h1 className="text-2xl font-extrabold text-slate-800">Welcome back</h1>
              <p className="text-sm text-slate-500 mt-1 mb-6">Sign in to your admin dashboard.</p>
              <ErrorBox message={error} />
              <form onSubmit={onPassword} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <div className="mt-1.5 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@gatd.com"
                      className={`${inputBase} pl-10 pr-3`}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Password</span>
                  <div className="mt-1.5 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputBase} pl-10 pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </label>

                <PrimaryButton loading={loading}>{loading ? "Signing in…" : "Sign in"}</PrimaryButton>
              </form>

              <p className="text-sm text-slate-500 mt-6 text-center">
                Need an account? Ask a Super Admin to create one for you.
              </p>
            </>
          )}

          {/* ── Step 2a: enter code ──────────────────────────────────────── */}
          {step === "verify" && (
            <>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-brand">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-2xl font-extrabold text-slate-800">Two-factor authentication</h1>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                {useBackup
                  ? "Enter one of your backup codes. Each code works only once."
                  : "Open Google Authenticator on your phone and enter the 6-digit code for GATD Dashboard."}
              </p>
              <ErrorBox message={error} />
              <form onSubmit={onVerify} className="space-y-4">
                {useBackup ? (
                  <input
                    type="text"
                    autoFocus
                    autoComplete="off"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ABCD-EFGH"
                    aria-label="Backup code"
                    className={`${inputBase} px-3 text-center text-xl font-bold tracking-widest font-mono`}
                  />
                ) : (
                  <CodeInput value={code} onChange={setCode} />
                )}
                <PrimaryButton loading={loading} disabled={loading || (!useBackup && code.length !== 6) || !code}>
                  {loading ? "Checking…" : "Verify and sign in"}
                </PrimaryButton>
              </form>
              <div className="mt-5 flex flex-col items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setUseBackup((v) => !v);
                    setCode("");
                    setError("");
                  }}
                  className="font-semibold text-brand hover:text-brand-dark"
                >
                  {useBackup ? "Use the code from my app instead" : "Lost your phone? Use a backup code"}
                </button>
                <button type="button" onClick={() => restart()} className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700">
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </button>
              </div>
            </>
          )}

          {/* ── Step 2b: first-time setup ────────────────────────────────── */}
          {step === "setup" && (
            <>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-brand">
                <Smartphone className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-2xl font-extrabold text-slate-800">Set up two-factor authentication</h1>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                For security, every dashboard account needs a code from an authenticator app when signing in. This takes about a minute.
              </p>
              <ErrorBox message={error} />

              <ol className="space-y-5">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">1</span>
                  <p className="text-sm text-slate-700">
                    Install <strong>Google Authenticator</strong> on your phone (free on the App Store and Google Play). Microsoft Authenticator or Authy also work.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">2</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">
                      In the app, tap <strong>+</strong> then <strong>Scan a QR code</strong>, and scan this:
                    </p>
                    <div className="mt-3 flex justify-center">
                      {qr ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={qr} alt="QR code to add GATD Dashboard to your authenticator app" width={200} height={200} className="rounded-lg border border-slate-200 p-2" />
                      ) : (
                        <div className="flex h-[200px] w-[200px] items-center justify-center rounded-lg border border-slate-200 text-slate-400">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      )}
                    </div>
                    {setupData?.secret && (
                      <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
                        <p className="text-xs text-slate-500">Can&apos;t scan? Choose &ldquo;Enter a setup key&rdquo; in the app and type this key:</p>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <code className="text-sm font-mono font-semibold text-slate-800 break-all">{secretGrouped}</code>
                          <button type="button" onClick={copyKey} aria-label="Copy setup key" className="shrink-0 text-slate-500 hover:text-slate-700">
                            {keyCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Account: {setupData.account} · Time based</p>
                      </div>
                    )}
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">3</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">Enter the 6-digit code the app now shows for <strong>GATD Dashboard</strong>:</p>
                    <form onSubmit={onEnable} className="mt-3 space-y-3">
                      <CodeInput value={code} onChange={setCode} autoFocus={false} />
                      <PrimaryButton loading={loading} disabled={loading || code.length !== 6 || !setupData}>
                        {loading ? "Checking…" : "Turn on and continue"}
                      </PrimaryButton>
                    </form>
                  </div>
                </li>
              </ol>

              <div className="mt-5 text-center">
                <button type="button" onClick={() => restart()} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </button>
              </div>
            </>
          )}

          {/* ── Step 3: save backup codes ────────────────────────────────── */}
          {step === "backup" && (
            <>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <KeyRound className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-2xl font-extrabold text-slate-800">Save your backup codes</h1>
              <p className="text-sm text-slate-500 mt-1 mb-5">
                Two-factor authentication is on. If you lose your phone, you can sign in with one of these codes instead. Each works once. Store them somewhere safe, such as a password manager.{" "}
                <strong className="text-slate-700">They won&apos;t be shown again.</strong>
              </p>

              <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                {backupCodes.map((c) => (
                  <code key={c} className="text-center text-sm font-mono font-semibold tracking-wider text-slate-800">
                    {c}
                  </code>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <button type="button" onClick={copyCodes} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {codesCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  {codesCopied ? "Copied" : "Copy"}
                </button>
                <button type="button" onClick={downloadCodes} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Download
                </button>
              </div>

              <label className="mt-5 flex items-start gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={savedCodes}
                  onChange={(e) => setSavedCodes(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#D52029]"
                />
                I&apos;ve saved my backup codes somewhere safe.
              </label>

              <button
                type="button"
                disabled={!savedCodes}
                onClick={() => finish(pendingSession.current)}
                className="mt-5 w-full py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to dashboard
              </button>
            </>
          )}

          {/* ── Signed in with a backup code ─────────────────────────────── */}
          {step === "backupUsed" && (
            <>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Info className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-2xl font-extrabold text-slate-800">Backup code used</h1>
              <p className="text-sm text-slate-600 mt-2">
                You have <strong>{backupLeft}</strong> backup code{backupLeft === 1 ? "" : "s"} left.
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {backupLeft <= 3
                  ? "You're running low. If you've lost your phone, ask a Super Admin to reset your two-factor authentication so you can set it up again on a new phone."
                  : "If you've lost your phone, ask a Super Admin to reset your two-factor authentication so you can set it up on a new phone."}
              </p>
              <button
                type="button"
                onClick={() => finish(pendingSession.current)}
                className="mt-6 w-full py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold text-sm transition-colors"
              >
                Continue to dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
