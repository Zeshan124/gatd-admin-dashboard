"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  X,
  Plus,
  Trash2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { uploadsApi } from "@/lib/adminApi";

export const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand transition-colors placeholder-slate-400";

/** Slug preview (backend re-validates/derives on save). */
export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function Labeled({ label, required, hint, error, children }) {
  return (
    <label className="block">
      {label && (
        <span className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </label>
  );
}

export function TextField({ label, required, hint, error, value, onChange, mono, ...rest }) {
  return (
    <Labeled label={label} required={required} hint={hint} error={error}>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} mt-1.5 ${mono ? "font-mono" : ""}`}
        {...rest}
      />
    </Labeled>
  );
}

export function TextArea({ label, required, hint, error, value, onChange, rows = 4, ...rest }) {
  return (
    <Labeled label={label} required={required} hint={hint} error={error}>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`${inputCls} mt-1.5 resize-y`}
        {...rest}
      />
    </Labeled>
  );
}

export function NumberField({ label, hint, error, value, onChange, ...rest }) {
  return (
    <Labeled label={label} hint={hint} error={error}>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} mt-1.5`}
        {...rest}
      />
    </Labeled>
  );
}

export function Toggle({ label, value, onChange, onText = "Active (public)", offText = "Hidden" }) {
  return (
    <Labeled label={label}>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`mt-1.5 inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold transition-colors w-full justify-center ${
          value
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-slate-300 bg-slate-50 text-slate-500"
        }`}
      >
        {value ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        {value ? onText : offText}
      </button>
    </Labeled>
  );
}

/** Image/PDF picker: upload OR paste a URL/path. Stores a string URL. */
export function MediaInput({ label, required, hint, value, onChange, kind = "image", error }) {
  const [uploading, setUploading] = useState(false);
  const [upErr, setUpErr] = useState("");
  const inputRef = useRef(null);
  const accept = kind === "pdf" ? "application/pdf" : "image/*";

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUpErr("");
    try {
      const res = await uploadsApi.upload(file);
      onChange(res.data.url);
    } catch (err) {
      setUpErr(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const isImg = kind === "image" && value;
  return (
    <Labeled label={label} required={required} hint={hint} error={error || upErr}>
      <div className="mt-1.5 flex items-start gap-3">
        <div className="shrink-0">
          {isImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-200 bg-slate-50" />
          ) : value ? (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="w-20 h-20 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-brand"
            >
              <FileText className="w-6 h-6" />
            </a>
          ) : (
            <div className="w-20 h-20 rounded-lg border border-dashed border-slate-300 flex items-center justify-center bg-slate-50 text-slate-300">
              {kind === "pdf" ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Uploading…" : "Upload"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1 px-2 py-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 text-sm"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
            <input ref={inputRef} type="file" accept={accept} onChange={onFile} className="hidden" />
          </div>
          <input
            value={value || ""}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder={kind === "pdf" ? "…or paste a PDF URL/path" : "…or paste an image URL/path"}
            className={`${inputCls} font-mono text-xs`}
          />
        </div>
      </div>
    </Labeled>
  );
}

/** Editable list of plain strings. */
export function StringListEditor({ label, hint, value, onChange, placeholder }) {
  const items = Array.isArray(value) ? value : [];
  const set = (i, v) => onChange(items.map((x, idx) => (idx === i ? v : x)));
  const add = () => onChange([...items, ""]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <Labeled label={label} hint={hint}>
      <div className="mt-1.5 space-y-2">
        {items.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={v} onChange={(e) => set(i, e.target.value)} placeholder={placeholder} className={inputCls} />
            <button type="button" onClick={() => remove(i)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
    </Labeled>
  );
}

/**
 * Editable list of objects. `fields` = [{ key, label, type?: "text"|"textarea" }].
 * New rows are pre-seeded with empty strings for each field.
 */
export function ObjectListEditor({ label, hint, value, onChange, fields, addLabel = "Add item" }) {
  const items = Array.isArray(value) ? value : [];
  const setField = (i, key, v) => onChange(items.map((x, idx) => (idx === i ? { ...x, [key]: v } : x)));
  const add = () => onChange([...items, Object.fromEntries(fields.map((f) => [f.key, ""]))]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <Labeled label={label} hint={hint}>
      <div className="mt-1.5 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2 bg-slate-50/50 relative">
            <button type="button" onClick={() => remove(i)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600" aria-label="Remove">
              <X className="w-4 h-4" />
            </button>
            {fields.map((f) =>
              f.type === "textarea" ? (
                <textarea
                  key={f.key}
                  value={item?.[f.key] || ""}
                  onChange={(e) => setField(i, f.key, e.target.value)}
                  placeholder={f.label}
                  rows={2}
                  className={`${inputCls} resize-y pr-6`}
                />
              ) : (
                <input
                  key={f.key}
                  value={item?.[f.key] || ""}
                  onChange={(e) => setField(i, f.key, e.target.value)}
                  placeholder={f.label}
                  className={`${inputCls} pr-6`}
                />
              )
            )}
          </div>
        ))}
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark">
          <Plus className="w-4 h-4" /> {addLabel}
        </button>
      </div>
    </Labeled>
  );
}

/**
 * Raw JSON editor for deeply-nested sections. `value` is the raw TEXT string;
 * the parent parses it at save time. Shows live validity.
 */
export function JsonField({ label, hint, value, onChange, rows = 8, error }) {
  let validity = "";
  if (value && value.trim()) {
    try {
      JSON.parse(value);
      validity = "ok";
    } catch {
      validity = "bad";
    }
  }
  return (
    <Labeled label={label} hint={hint} error={error || (validity === "bad" ? "Invalid JSON — fix before saving" : "")}>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        spellCheck={false}
        className={`${inputCls} font-mono text-xs resize-y mt-1.5`}
      />
      {validity === "ok" && (
        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
          <Check className="w-3 h-3" /> Valid JSON
        </p>
      )}
    </Labeled>
  );
}

/** A titled group of fields inside a form. */
export function Section({ title, description, children }) {
  return (
    <section className="space-y-4">
      <div className="border-b border-slate-100 pb-2">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h4>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** Right-hand slide-in drawer shell with header/body/footer. */
export function DrawerShell({ title, subtitle, onClose, children, footer, width = "max-w-2xl" }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className={`relative w-full ${width} bg-white h-full shadow-2xl flex flex-col animate-[cmsSlide_0.2s_ease-out]`}>
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="min-w-0">
            {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
            <h3 className="text-lg font-bold text-slate-800 mt-0.5 truncate">{title}</h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 shrink-0">{footer}</div>}
      </aside>
      <style jsx global>{`
        @keyframes cmsSlide {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Confirm-delete modal. `onConfirm(cascade)` should throw an Error whose
 * `.body.error.code` is HAS_CHILDREN / HAS_PROGRAMS to trigger the cascade prompt.
 */
export function DeleteDialog({ title, description, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cascade, setCascade] = useState(false);

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      await onConfirm(cascade);
      onClose();
    } catch (e) {
      const code = e?.body?.error?.code || "";
      if (code === "HAS_CHILDREN" || code === "HAS_PROGRAMS") {
        setCascade(true);
        setError(e.message);
      } else {
        setError(e.message || "Could not delete.");
      }
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <button onClick={onClose} disabled={busy} className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60">
            Cancel
          </button>
          <button
            onClick={run}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-60"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {cascade ? "Delete it and everything under it" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
