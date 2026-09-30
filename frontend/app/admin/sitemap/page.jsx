"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Map,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  Globe,
  GraduationCap,
  Layers,
  BookOpen,
  Newspaper,
  FileText,
} from "lucide-react";
import { sitemapApi } from "@/lib/adminApi";

const TYPE_CARDS = [
  { key: "static", label: "Site pages", icon: FileText, accent: "bg-slate-100 text-slate-600" },
  { key: "solutions", label: "Solutions", icon: GraduationCap, accent: "bg-red-50 text-[#D52029]" },
  { key: "programs", label: "Programs", icon: Layers, accent: "bg-amber-50 text-amber-600" },
  { key: "subprograms", label: "Subprograms", icon: BookOpen, accent: "bg-emerald-50 text-emerald-600" },
  { key: "blogs", label: "Blog posts", icon: Newspaper, accent: "bg-indigo-50 text-indigo-600" },
];

export default function AdminSitemap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await sitemapApi.summary();
      setData(res?.data || null);
    } catch (e) {
      setError(e?.message || "Could not load the sitemap summary.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const copyUrl = async () => {
    if (!data?.url) return;
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#D52029]">
            <Map className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-800">XML Sitemap</h1>
            <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
              The sitemap is generated live from your content, so newly added Solutions,
              Programs, Subprograms and Blog posts are included automatically — no
              manual regeneration needed.
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-[#D52029] hover:text-[#D52029] transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading sitemap…
        </div>
      ) : data ? (
        <>
          {/* Sitemap URL */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Sitemap URL
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <code className="flex-1 min-w-0 truncate rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
                {data.url}
              </code>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={copyUrl}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-[#D52029] hover:text-[#D52029] transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <a
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#D52029] px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
              </div>
            </div>
          </div>

          {/* Total + breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-white">
                  <Globe className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-800">{data.total}</p>
              <p className="text-xs text-slate-500">Total URLs</p>
            </div>
            {TYPE_CARDS.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.key} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${c.accent}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-2xl font-bold text-slate-800">
                    {data.counts?.[c.key] ?? 0}
                  </p>
                  <p className="text-xs text-slate-500">{c.label}</p>
                </div>
              );
            })}
          </div>

          {/* Submit guidance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-2">Submit to search engines</h2>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-600">
              <li>
                Open{" "}
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#D52029] hover:underline"
                >
                  Google Search Console
                </a>{" "}
                for your website property.
              </li>
              <li>Go to <span className="font-medium text-slate-700">Sitemaps</span> in the left menu.</li>
              <li>
                Enter <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">sitemap.xml</code> and submit.
              </li>
              <li>Google re-crawls periodically — new content is picked up automatically since the sitemap is live.</li>
            </ol>
          </div>

          {/* Sample URLs */}
          {Array.isArray(data.sample) && data.sample.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                Sample of included URLs
              </p>
              <ul className="space-y-1.5">
                {data.sample.map((u) => (
                  <li key={u} className="truncate text-sm text-slate-600">
                    {u}
                  </li>
                ))}
              </ul>
              {data.total > data.sample.length && (
                <p className="mt-3 text-xs text-slate-400">
                  + {data.total - data.sample.length} more in the full sitemap.
                </p>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
