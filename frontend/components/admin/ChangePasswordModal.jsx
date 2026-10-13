"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/adminApi";
import { inputCls, Labeled } from "@/components/admin/cms/FormKit";

/** Lets any signed-in dashboard user change their own password. */
export default function ChangePasswordModal({ onClose }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fe, setFe] = useState({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setFe({});
    if (next !== confirm) {
      setFe({ confirm: "Passwords don't match" });
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword(current, next);
      setDone(true);
    } catch (err) {
      const fields = err?.body?.error?.fields;
      if (fields && typeof fields === "object") setFe(fields);
      setError(err.message || "Could not change your password.");
    } finally {
      setSaving(false);
    }
  };

  // Rendered into <body> so it sits above the sidebar (the top bar has its own
  // stacking layer, which would otherwise keep the dialog underneath it).
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="cp-title" className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 id="cp-title" className="text-lg font-bold text-slate-800">Change password</h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
            <p className="mt-3 font-semibold text-slate-800">Your password has been changed.</p>
            <p className="mt-1 text-sm text-slate-500">Use the new password the next time you sign in.</p>
            <button onClick={onClose} className="mt-6 px-5 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-bold">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <Labeled label="Current password" required error={fe.currentPassword}>
              <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={`${inputCls} mt-1.5`} />
            </Labeled>
            <Labeled label="New password" required hint="At least 8 characters." error={fe.newPassword}>
              <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={`${inputCls} mt-1.5`} />
            </Labeled>
            <Labeled label="Confirm new password" required error={fe.confirm}>
              <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={`${inputCls} mt-1.5`} />
            </Labeled>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-bold disabled:opacity-60">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Change password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
