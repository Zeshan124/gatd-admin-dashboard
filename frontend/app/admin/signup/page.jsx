"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/components/admin/AuthProvider";
import { SIGNUP_KEY } from "@/lib/adminApi";

export default function SignupPage() {
  const { signup, token, hydrated } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    signupKey: SIGNUP_KEY,
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (hydrated && token) router.replace("/admin");
  }, [hydrated, token, router]);

  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await signup(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        },
        form.signupKey.trim()
      );
      if (data?.token) {
        router.replace("/admin"); // auto-logged in
      } else {
        setDone(true); // created, but needs to log in
      }
    } catch (err) {
      setError(err.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            Account created
          </h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Your admin account is ready. Please sign in to continue.
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center w-full py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold text-sm transition-colors"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-black text-lg">
            G
          </div>
          <span className="text-xl font-bold text-slate-800">
            GATD <span className="text-slate-400 font-medium">Admin</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-extrabold text-slate-800">
            Create account
          </h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Set up a new admin dashboard account.
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-brand">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Full name</span>
              <div className="mt-1.5 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={change}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-300 outline-none focus:border-brand text-sm text-slate-800 placeholder-slate-400"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <div className="mt-1.5 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={change}
                  placeholder="you@gatd.com"
                  className="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-300 outline-none focus:border-brand text-sm text-slate-800 placeholder-slate-400"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={change}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-300 outline-none focus:border-brand text-sm text-slate-800 placeholder-slate-400"
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

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Signup key
              </span>
              <div className="mt-1.5 relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="signupKey"
                  required
                  value={form.signupKey}
                  onChange={change}
                  placeholder="Provided signup key"
                  className="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-300 outline-none focus:border-brand text-sm text-slate-800 placeholder-slate-400"
                />
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Required by the backend to create an account.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Already have an account?{" "}
            <Link
              href="/admin/login"
              className="text-brand font-semibold hover:text-brand-dark"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
