"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Eye, Loader2, RefreshCw } from "lucide-react";
import { sitePopupApi } from "@/lib/adminApi";
import {
  TextField,
  TextArea,
  NumberField,
  Toggle,
  MediaInput,
  Section,
  Labeled,
  inputCls,
} from "@/components/admin/cms/FormKit";
import { SitePopupCard } from "@/components/SitePopup";

const EMPTY = {
  isEnabled: false,
  showFrom: "",
  showUntil: "",
  frequency: "session",
  delaySeconds: 1,
  eyebrow: "",
  titleHighlight: "",
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  locationCity: "",
  locationCountry: "",
  priceLabel: "",
  price: "",
  priceUnit: "",
  badgeText: "",
  buttonText: "",
  buttonUrl: "",
  image: "",
};

const FREQUENCIES = [
  { value: "session", label: "Once per visit (browser session)" },
  { value: "daily", label: "Once per day" },
  { value: "always", label: "Every page load" },
];

function toForm(d = {}) {
  const f = { ...EMPTY };
  for (const k of Object.keys(EMPTY)) if (d[k] != null) f[k] = d[k];
  f.isEnabled = d.isEnabled === true;
  return f;
}

function DateField({ label, value, onChange, hint, error }) {
  return (
    <Labeled label={label} hint={hint} error={error}>
      <input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} className={`${inputCls} mt-1.5`} />
    </Labeled>
  );
}

export default function SitePopupPage() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [fieldErrs, setFieldErrs] = useState({});
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  const set = (key) => (value) => setForm((p) => ({ ...p, [key]: value }));

  const load = async () => {
    setLoading(true);
    setLoadErr("");
    try {
      const res = await sitePopupApi.get();
      setForm(toForm(res?.data));
    } catch (err) {
      setLoadErr(err.message || "Could not load popup settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setSaveErr("");
    setFieldErrs({});
    setSaved(false);
    try {
      const res = await sitePopupApi.update({
        ...form,
        delaySeconds: form.delaySeconds === "" ? 1 : Number(form.delaySeconds),
      });
      setForm(toForm(res?.data));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const fields = err?.body?.error?.fields;
      if (fields) setFieldErrs(fields);
      setSaveErr(fields ? "Please fix the highlighted fields." : err.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!preview) return;
    const onKey = (e) => e.key === "Escape" && setPreview(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className="max-w-2xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">{loadErr}</p>
            <button
              onClick={load}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 hover:text-red-800"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fe = fieldErrs;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Website Popup</h2>
        <p className="text-sm text-slate-500 mt-1">
          A promotional popup shown to visitors shortly after they open the
          website (all public pages). Leave a field empty to hide that part of
          the popup.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
        <Section title="Visibility" description="When and how often visitors see the popup.">
          <Toggle
            label="Popup"
            value={form.isEnabled}
            onChange={set("isEnabled")}
            onText="Enabled on website"
            offText="Disabled"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateField
              label="Show from"
              value={form.showFrom}
              onChange={set("showFrom")}
              error={fe.showFrom}
              hint="Optional. Empty = show immediately."
            />
            <DateField
              label="Show until"
              value={form.showUntil}
              onChange={set("showUntil")}
              error={fe.showUntil}
              hint="Optional. Hides automatically after this day."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Labeled label="How often" error={fe.frequency}>
              <select
                value={form.frequency}
                onChange={(e) => set("frequency")(e.target.value)}
                className={`${inputCls} mt-1.5 bg-white`}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Labeled>
            <NumberField
              label="Delay (seconds)"
              value={form.delaySeconds}
              onChange={set("delaySeconds")}
              error={fe.delaySeconds}
              min={0}
              max={60}
              hint="Time after the page opens before it appears."
            />
          </div>
        </Section>

        <Section title="Content">
          <TextField label="Eyebrow" value={form.eyebrow} onChange={set("eyebrow")} error={fe.eyebrow} placeholder="Upcoming Programme" maxLength={120} />
          <TextField
            label="Title (red line)"
            value={form.titleHighlight}
            onChange={set("titleHighlight")}
            error={fe.titleHighlight}
            placeholder="Strategic Leadership"
            maxLength={160}
          />
          <TextField
            label="Title (dark line)"
            value={form.title}
            onChange={set("title")}
            error={fe.title}
            placeholder="for Public Sector Transformation"
            maxLength={255}
          />
          <TextArea
            label="Description"
            value={form.description}
            onChange={set("description")}
            error={fe.description}
            rows={3}
            maxLength={1000}
          />
          <MediaInput
            label="Image"
            kind="image"
            value={form.image}
            onChange={set("image")}
            error={fe.image}
            hint="Shown on the right side (top on mobile). A portrait or square photo works best."
          />
        </Section>

        <Section title="Date & location">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateField label="Start date" value={form.startDate} onChange={set("startDate")} error={fe.startDate} />
            <DateField label="End date" value={form.endDate} onChange={set("endDate")} error={fe.endDate} hint="Optional for single-day events." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="City" value={form.locationCity} onChange={set("locationCity")} error={fe.locationCity} placeholder="Kuala Lumpur" maxLength={120} />
            <TextField label="Country" value={form.locationCountry} onChange={set("locationCountry")} error={fe.locationCountry} placeholder="Malaysia" maxLength={120} />
          </div>
        </Section>

        <Section title="Investment & offer">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField label="Label" value={form.priceLabel} onChange={set("priceLabel")} error={fe.priceLabel} placeholder="Investment" maxLength={60} />
            <TextField label="Price" value={form.price} onChange={set("price")} error={fe.price} placeholder="SGD 4,500" maxLength={60} />
            <TextField label="Unit" value={form.priceUnit} onChange={set("priceUnit")} error={fe.priceUnit} placeholder="/person" maxLength={40} />
          </div>
          <TextField
            label="Offer badge"
            value={form.badgeText}
            onChange={set("badgeText")}
            error={fe.badgeText}
            placeholder="10% Group Discount (5+)"
            maxLength={120}
          />
        </Section>

        <Section title="Button">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Button text" value={form.buttonText} onChange={set("buttonText")} error={fe.buttonText} placeholder="Explore the Programme" maxLength={80} />
            <TextField
              label="Button link"
              value={form.buttonUrl}
              onChange={set("buttonUrl")}
              error={fe.buttonUrl}
              placeholder="/solutions/..."
              hint="Use a site path or https:// URL (external links open in a new tab)."
            />
          </div>
        </Section>

        {saveErr && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{saveErr}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            onClick={() => setPreview(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-[70] flex justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreview(false)} />
          <div className="relative w-full max-w-3xl my-auto flex justify-center">
            <SitePopupCard popup={form} onClose={() => setPreview(false)} preview />
          </div>
        </div>
      )}
    </div>
  );
}
