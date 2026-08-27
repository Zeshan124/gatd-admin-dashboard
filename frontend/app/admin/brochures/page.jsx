"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Inbox,
  FileDown,
  ExternalLink,
  Loader2,
  FileSpreadsheet,
  FileText,
  Calendar,
} from "lucide-react";
import { brochuresApi, API_BASE } from "@/lib/adminApi";
import { formatDate, formatDateTime } from "@/lib/format";
import StatusBadge, { BROCHURE_STATUSES } from "@/components/admin/StatusBadge";

const PAGE_SIZE = 25;

function TypeBadge({ type }) {
  const cls =
    type === "solution"
      ? "bg-purple-50 text-purple-700 ring-purple-200"
      : type === "program"
      ? "bg-teal-50 text-teal-700 ring-teal-200"
      : "bg-slate-100 text-slate-600 ring-slate-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${cls}`}>
      {type === "solution" ? "Solution" : type === "program" ? "Program" : type || "—"}
    </span>
  );
}

export default function BrochuresPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await brochuresApi.list({ q, status, sourceType, dateFrom, dateTo, page, pageSize: PAGE_SIZE });
      setRows(res.data || []);
      setMeta(res.meta || null);
    } catch (e) {
      setError(e.message);
      setRows([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [q, status, sourceType, dateFrom, dateTo, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (row) => {
    setSelected(row);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const res = await brochuresApi.get(row.id);
      setDetail(res.data || res);
    } catch (e) {
      setDetailError(e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setDetail(null);
    setDetailError("");
  };

  const changeStatus = async (newStatus) => {
    const id = detail?.id ?? selected?.id;
    if (!id) return;
    setSavingStatus(true);
    setDetailError("");
    try {
      await brochuresApi.updateStatus(id, newStatus);
      setDetail((d) => (d && d.id === id ? { ...d, status: newStatus } : d));
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    } catch (e) {
      setDetailError(e.message);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleExport = async (format) => {
    setExportOpen(false);
    setExportError("");
    setExporting(true);
    try {
      const { blob, filename } = await brochuresApi.exportFile({
        q,
        status,
        sourceType,
        dateFrom,
        dateTo,
        ...(format === "csv" ? { format: "csv" } : {}),
      });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: url, download: filename });
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e.message || "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const total = meta?.total ?? rows.length;
  const totalPages = meta?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Brochure Leads</h2>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? "Loading…" : `${total} total lead${total === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="relative">
            <button
              onClick={() => setExportOpen((o) => !o)}
              disabled={exporting || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting ? "Exporting…" : "Export"}
              {!exporting && <ChevronDown className="w-4 h-4" />}
            </button>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1 overflow-hidden">
                  <button onClick={() => handleExport("xlsx")} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    Excel (.xlsx)
                  </button>
                  <button onClick={() => handleExport("csv")} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                    <FileText className="w-4 h-4 text-slate-500" />
                    CSV (.csv)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 flex-1 min-w-56 focus-within:border-brand transition-colors">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email, organisation, item…"
            className="bg-transparent outline-none text-sm w-full text-slate-700 placeholder-slate-400"
          />
          {searchInput && (
            <button onClick={() => setSearchInput("")} aria-label="Clear search">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <select
          value={sourceType}
          onChange={(e) => {
            setSourceType(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand transition-colors"
        >
          <option value="">All types</option>
          <option value="solution">Solution</option>
          <option value="program">Program</option>
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand transition-colors"
        >
          <option value="">All statuses</option>
          {BROCHURE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Date range */}
        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 focus-within:border-brand transition-colors">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            aria-label="From date"
            className="bg-transparent outline-none text-sm text-slate-700 w-36"
          />
          <span className="text-slate-400 text-sm">–</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            aria-label="To date"
            className="bg-transparent outline-none text-sm text-slate-700 w-36"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
              aria-label="Clear dates"
            >
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* Export error */}
      {exportError && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{exportError}</span>
          <button onClick={() => setExportError("")} aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <p className="font-semibold text-slate-700">Couldn&apos;t load brochure leads</p>
            <p className="text-sm text-slate-500 max-w-md">{error}</p>
            <p className="text-xs text-slate-400 mt-1">API: {API_BASE}</p>
            <button onClick={load} className="mt-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark">
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading brochure leads…</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Inbox className="w-8 h-8 text-slate-300" />
            <p className="font-semibold text-slate-600">No brochure leads found</p>
            <p className="text-sm text-slate-400">
              {q || status || sourceType || dateFrom || dateTo
                ? "Try adjusting your filters."
                : "New downloads will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Item</th>
                  <th className="px-5 py-3 font-semibold">Country</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => openDetail(r)}
                    className="hover:bg-brand-50/60 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <TypeBadge type={r.sourceType} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                      {r.itemTitle || r.itemSlug || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{r.country || "—"}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} statuses={BROCHURE_STATUSES} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!error && !loading && rows.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold">{from}</span>–
              <span className="font-semibold">{to}</span> of{" "}
              <span className="font-semibold">{total}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="px-3 text-sm text-slate-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <DetailDrawer
          summary={selected}
          detail={detail}
          loading={detailLoading}
          error={detailError}
          savingStatus={savingStatus}
          onChangeStatus={changeStatus}
          onClose={closeDetail}
        />
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5 break-words">{value || "—"}</p>
    </div>
  );
}

function DetailDrawer({ summary, detail, loading, error, savingStatus, onChangeStatus, onClose }) {
  const d = detail || summary;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-slate-400">
              <FileDown className="w-4 h-4" />
              <span className="text-xs">Brochure lead</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mt-1">{d.name}</h3>
            <a href={`mailto:${d.email}`} className="text-sm text-brand hover:underline">
              {d.email}
            </a>
            <div className="mt-2 flex items-center gap-2">
              <TypeBadge type={d.sourceType} />
              <StatusBadge status={d.status} statuses={BROCHURE_STATUSES} />
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
              {error}
            </div>
          )}

          {/* Status changer */}
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1.5">Status</p>
            <select
              value={d.status || ""}
              disabled={savingStatus}
              onChange={(e) => onChangeStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand disabled:opacity-60"
            >
              {BROCHURE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {savingStatus && <p className="text-xs text-slate-400 mt-1">Saving…</p>}
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading details…</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Country" value={d.country} />
                <Field label="Organisation" value={d.organization} />
                <Field label="Requested item" value={d.itemTitle || d.itemSlug} />
                <Field label="Received" value={formatDateTime(d.createdAt)} />
              </div>

              {d.brochure && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-1.5">Brochure</p>
                  <a
                    href={d.brochure}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-brand hover:underline break-all"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    {d.brochure}
                  </a>
                </div>
              )}

              <Field label="Source page" value={d.sourcePage} />
            </>
          )}
        </div>
      </aside>

      <style jsx>{`
        @keyframes slideIn {
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
