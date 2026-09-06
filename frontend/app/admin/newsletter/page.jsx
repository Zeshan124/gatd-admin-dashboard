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
  Send,
  Loader2,
  Check,
  FileSpreadsheet,
  FileText,
  Calendar,
  Trash2,
} from "lucide-react";
import { newsletterApi, API_BASE } from "@/lib/adminApi";
import { formatDate, formatDateTime } from "@/lib/format";
import StatusBadge, { NEWSLETTER_STATUSES } from "@/components/admin/StatusBadge";

const PAGE_SIZE = 25;

export default function NewsletterPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      const res = await newsletterApi.list({ q, status, dateFrom, dateTo, page, pageSize: PAGE_SIZE });
      setRows(res.data || []);
      setMeta(res.meta || null);
    } catch (e) {
      setError(e.message);
      setRows([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [q, status, dateFrom, dateTo, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (row) => {
    setSelected(row);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const res = await newsletterApi.get(row.id);
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

  const saveSubscriber = async (fields) => {
    const id = detail?.id ?? selected?.id;
    if (!id) return;
    setSaving(true);
    setDetailError("");
    try {
      const res = await newsletterApi.update(id, fields);
      const updated = res.data || res;
      setDetail(updated);
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...updated } : r)));
    } catch (e) {
      setDetailError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async () => {
    const id = detail?.id ?? selected?.id;
    if (!id) return;
    setDeleting(true);
    setDetailError("");
    try {
      await newsletterApi.remove(id);
      setRows((rs) => rs.filter((r) => r.id !== id));
      setMeta((m) => (m ? { ...m, total: Math.max(0, (m.total || 0) - 1) } : m));
      closeDetail();
    } catch (e) {
      setDetailError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async (format) => {
    setExportOpen(false);
    setExportError("");
    setExporting(true);
    try {
      const { blob, filename } = await newsletterApi.exportFile({
        q,
        status,
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
          <h2 className="text-2xl font-extrabold text-slate-800">Newsletter Subscriptions</h2>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? "Loading…" : `${total} total subscriber${total === 1 ? "" : "s"}`}
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
            placeholder="Search email or name…"
            className="bg-transparent outline-none text-sm w-full text-slate-700 placeholder-slate-400"
          />
          {searchInput && (
            <button onClick={() => setSearchInput("")} aria-label="Clear search">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand transition-colors"
        >
          <option value="">All statuses</option>
          {NEWSLETTER_STATUSES.map((s) => (
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
            <p className="font-semibold text-slate-700">Couldn&apos;t load subscribers</p>
            <p className="text-sm text-slate-500 max-w-md">{error}</p>
            <p className="text-xs text-slate-400 mt-1">API: {API_BASE}</p>
            <button onClick={load} className="mt-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark">
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading subscribers…</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Inbox className="w-8 h-8 text-slate-300" />
            <p className="font-semibold text-slate-600">No subscribers found</p>
            <p className="text-sm text-slate-400">
              {q || status || dateFrom || dateTo ? "Try adjusting your filters." : "New newsletter sign-ups will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => openDetail(r)}
                    className="hover:bg-brand-50/60 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{r.email}</td>
                    <td className="px-5 py-3.5 text-slate-600">{r.name || <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} statuses={NEWSLETTER_STATUSES} />
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

      {/* Detail / edit drawer */}
      {selected && (
        <DetailDrawer
          summary={selected}
          detail={detail}
          loading={detailLoading}
          error={detailError}
          saving={saving}
          onSave={saveSubscriber}
          onDelete={deleteRecord}
          deleting={deleting}
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

function DetailDrawer({ summary, detail, loading, error, saving, onSave, onDelete, deleting, onClose }) {
  const d = detail || summary;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(d.name || "");
  const [email, setEmail] = useState(d.email || "");
  const [status, setStatus] = useState(d.status || "subscribed");
  const [savedFlash, setSavedFlash] = useState(false);

  // Re-sync the form when the loaded detail arrives/changes.
  useEffect(() => {
    if (detail) {
      setName(detail.name || "");
      setEmail(detail.email || "");
      setStatus(detail.status || "subscribed");
    }
  }, [detail]);

  const dirty =
    (name || "") !== (d.name || "") ||
    (email || "") !== (d.email || "") ||
    (status || "") !== (d.status || "");

  const handleSave = async () => {
    await onSave({ name: name.trim(), email: email.trim(), status });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-slate-400">
              <Send className="w-4 h-4" />
              <span className="text-xs">Newsletter subscriber</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mt-1 break-all">{d.email}</h3>
            <div className="mt-2">
              <StatusBadge status={d.status} statuses={NEWSLETTER_STATUSES} />
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

          {loading ? (
            <p className="text-sm text-slate-400">Loading details…</p>
          ) : (
            <>
              {/* Editable fields */}
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="—"
                    className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-slate-400">Status</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand"
                  >
                    {NEWSLETTER_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving || !dirty}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  {savedFlash && !dirty && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
                      <Check className="w-4 h-4" /> Saved
                    </span>
                  )}
                </div>
              </div>

              {/* Provenance */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <Field label="Source page" value={d.sourcePage} />
                <Field label="Subscribed" value={formatDateTime(d.createdAt)} />
              </div>
            </>
          )}

          {/* Delete */}
          <div className="pt-2 border-t border-slate-100">
            {confirmDelete ? (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm font-semibold text-red-700 mb-2">Delete this subscriber? They will be removed from the list.</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setConfirmDelete(false)} disabled={deleting} className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60">
                    Cancel
                  </button>
                  <button onClick={onDelete} disabled={deleting} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-60">
                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />} Delete
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" /> Delete subscriber
              </button>
            )}
          </div>
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
