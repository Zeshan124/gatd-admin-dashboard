"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Loader2, RefreshCw } from "lucide-react";
import { accreditationApi } from "@/lib/adminApi";
import { TextField, ObjectListEditor, Section } from "@/components/admin/cms/FormKit";

export default function AccreditationPage() {
  const [heading, setHeading] = useState("");
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadErr("");
    try {
      const res = await accreditationApi.get();
      const d = res?.data || {};
      setHeading(d.heading || "");
      setLogos(Array.isArray(d.logos) ? d.logos : []);
    } catch (err) {
      setLoadErr(err.message || "Could not load accreditation settings.");
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
      const cleaned = (logos || [])
        .map((l) => ({ name: (l.name || "").trim(), logo: (l.logo || "").trim() }))
        .filter((l) => l.logo);
      const res = await accreditationApi.update({ heading, logos: cleaned });
      const d = res?.data || {};
      setHeading(d.heading || "");
      setLogos(Array.isArray(d.logos) ? d.logos : []);
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
            <button onClick={load} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 hover:text-red-800">
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
        <h2 className="text-xl font-bold text-slate-800">Accredited By</h2>
        <p className="text-sm text-slate-500 mt-1">
          The heading and accreditation logos shown in the “Accredited By” section on every
          Program page. To hide the section on a specific program, use its “Accredited By”
          toggle under Admin → Subprograms.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
        <Section title="Section content">
          <TextField
            label="Heading"
            value={heading}
            onChange={setHeading}
            placeholder="Accredited By"
            hint="Shown above the logos (max 255 characters)."
            maxLength={255}
          />
          <ObjectListEditor
            label="Logos"
            value={logos}
            onChange={setLogos}
            addLabel="Add logo"
            itemLabel="Logo"
            labeledFields
            fields={[
              { key: "name", label: "Name / alt text", placeholder: "e.g. Cambridge International Academics" },
              { key: "logo", label: "Logo image", type: "image" },
            ]}
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
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
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
