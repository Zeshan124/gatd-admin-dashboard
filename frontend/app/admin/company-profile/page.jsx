"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Loader2, RefreshCw } from "lucide-react";
import { companyProfileApi } from "@/lib/adminApi";
import {
  TextField,
  TextArea,
  Toggle,
  MediaInput,
  Section,
} from "@/components/admin/cms/FormKit";

const EMPTY = {
  isEnabled: true,
  eyebrow: "",
  heading: "",
  description: "",
  buttonLabel: "",
  pdfUrl: "",
};

export default function CompanyProfilePage() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [saved, setSaved] = useState(false);

  const set = (key) => (value) => setForm((p) => ({ ...p, [key]: value }));

  const load = async () => {
    setLoading(true);
    setLoadErr("");
    try {
      const res = await companyProfileApi.get();
      const d = res?.data || {};
      setForm({
        isEnabled: d.isEnabled !== false,
        eyebrow: d.eyebrow || "",
        heading: d.heading || "",
        description: d.description || "",
        buttonLabel: d.buttonLabel || "",
        pdfUrl: d.pdfUrl || "",
      });
    } catch (err) {
      setLoadErr(err.message || "Could not load company profile settings.");
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
    setSaved(false);
    try {
      const res = await companyProfileApi.update({
        isEnabled: form.isEnabled,
        eyebrow: form.eyebrow,
        heading: form.heading,
        description: form.description,
        buttonLabel: form.buttonLabel,
        pdfUrl: form.pdfUrl,
      });
      const d = res?.data || {};
      setForm({
        isEnabled: d.isEnabled !== false,
        eyebrow: d.eyebrow || "",
        heading: d.heading || "",
        description: d.description || "",
        buttonLabel: d.buttonLabel || "",
        pdfUrl: d.pdfUrl || "",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const fields = err?.body?.error?.fields;
      const firstField = fields ? Object.values(fields)[0] : null;
      setSaveErr(firstField || err.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Company Profile</h2>
        <p className="text-sm text-slate-500 mt-1">
          Controls the “Company Profile” button in the site header and the
          download popup it opens. Leads captured here appear under Brochure
          Leads.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
        <Section
          title="Visibility"
          description="Turn the header button on or off across the site."
        >
          <Toggle
            label="Header button"
            value={form.isEnabled}
            onChange={set("isEnabled")}
            onText="Shown in header"
            offText="Hidden"
          />
        </Section>

        <Section
          title="Popup content"
          description="Text shown inside the Company Profile popup."
        >
          <TextField
            label="Button label"
            value={form.buttonLabel}
            onChange={set("buttonLabel")}
            placeholder="Company Profile"
            hint="Text on the header button (max 80 characters). Defaults to “Company Profile”."
            maxLength={80}
          />
          <TextField
            label="Eyebrow"
            value={form.eyebrow}
            onChange={set("eyebrow")}
            placeholder="Company Profile"
            hint="Small label above the popup heading (max 120 characters)."
            maxLength={120}
          />
          <TextField
            label="Heading"
            value={form.heading}
            onChange={set("heading")}
            placeholder="Download Our Company Profile"
            hint="Main popup heading (max 255 characters)."
            maxLength={255}
          />
          <TextArea
            label="Description / disclaimer"
            value={form.description}
            onChange={set("description")}
            rows={3}
            placeholder="Enter your details and we will share the GATD company profile with you."
            hint="Shown as the fine print under the form."
          />
        </Section>

        <Section
          title="File"
          description="The PDF users receive after submitting the form."
        >
          <MediaInput
            label="Company profile PDF"
            kind="pdf"
            value={form.pdfUrl}
            onChange={set("pdfUrl")}
            hint="Upload a PDF or paste a path/URL. Defaults to /brochures/GATD-Company-Profile.pdf."
          />
        </Section>

        {saveErr && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{saveErr}</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark disabled:opacity-60 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
