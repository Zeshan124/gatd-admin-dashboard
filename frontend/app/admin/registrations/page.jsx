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
  Loader2,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { registrationsApi, API_BASE } from "@/lib/adminApi";
import { formatMoney, formatDate, formatDateTime } from "@/lib/format";
import StatusBadge, {
  REGISTRATION_STATUSES,
} from "@/components/admin/StatusBadge";

const PAGE_SIZE = 25;
const SORT = "-created_at";

export default function RegistrationsPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [solution, setSolution] = useState("");
  const [program, setProgram] = useState("");
  const [page, setPage] = useState(1);

  const [facets, setFacets] = useState({ solutions: [], programs: [] });

  const [selected, setSelected] = useState(null); // row summary
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportError, setExportError] = useState("");

  // Debounce the search box → q.
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
      const res = await registrationsApi.list({
        q,
        status,
        solution,
        program,
        page,
        pageSize: PAGE_SIZE,
        sort: SORT,
      });
      setRows(res.data || []);
      setMeta(res.meta || null);
    } catch (e) {
      setError(e.message);
      setRows([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [q, status, solution, program, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Filter options (loaded once).
  useEffect(() => {
    registrationsApi
      .facets()
      .then((res) => setFacets(res.data || { solutions: [], programs: [] }))
      .catch(() => {});
  }, []);

  const openDetail = async (row) => {
    setSelected(row);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const res = await registrationsApi.get(row.id);
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
    if (!id || newStatus === (detail?.status ?? selected?.status)) return;
    setSavingStatus(true);
    setDetailError("");
    try {
      await registrationsApi.updateStatus(id, newStatus);
      setDetail((d) => (d ? { ...d, status: newStatus } : d));
      setRows((rs) =>
        rs.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
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
      const { blob, filename } = await registrationsApi.exportFile({
        q,
        status,
        solution,
        program,
        sort: SORT,
        ...(format === "csv" ? { format: "csv" } : {}),
      });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: filename,
      });
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
          <h2 className="text-2xl font-extrabold text-slate-800">Registrations</h2>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? "Loading…" : `${total} total registration${total === 1 ? "" : "s"}`}
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
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {exporting ? "Exporting…" : "Export"}
              {!exporting && <ChevronDown className="w-4 h-4" />}
            </button>

            {exportOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setExportOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1 overflow-hidden">
                  <button
                    onClick={() => handleExport("xlsx")}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
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
            placeholder="Search name, email, organisation, reference…"
            className="bg-transparent outline-none text-sm w-full text-slate-700 placeholder-slate-400"
          />
          {searchInput && (
            <button onClick={() => setSearchInput("")} aria-label="Clear search">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <select
          value={solution}
          onChange={(e) => {
            setSolution(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand transition-colors max-w-56"
        >
          <option value="">All solutions</option>
          {facets.solutions.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={program}
          onChange={(e) => {
            setProgram(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand transition-colors max-w-64"
        >
          <option value="">All programmes</option>
          {facets.programs.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title}
            </option>
          ))}
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
          {REGISTRATION_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
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
            <p className="font-semibold text-slate-700">Couldn&apos;t load registrations</p>
            <p className="text-sm text-slate-500 max-w-md">{error}</p>
            <p className="text-xs text-slate-400 mt-1">API: {API_BASE}</p>
            <button
              onClick={load}
              className="mt-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading registrations…</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Inbox className="w-8 h-8 text-slate-300" />
            <p className="font-semibold text-slate-600">No registrations found</p>
            <p className="text-sm text-slate-400">
              {q || status ? "Try adjusting your filters." : "New submissions will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 font-semibold">Reference</th>
                  <th className="px-5 py-3 font-semibold">Applicant</th>
                  <th className="px-5 py-3 font-semibold">Organisation</th>
                  <th className="px-5 py-3 font-semibold">Solution</th>
                  <th className="px-5 py-3 font-semibold">Programme(s)</th>
                  <th className="px-5 py-3 font-semibold text-right">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => openDetail(r)}
                    className="hover:bg-brand-50/60 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {r.referenceNo}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">
                        {r.firstName} {r.lastName || ""}
                      </p>
                      <p className="text-xs text-slate-400">{r.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {r.organization || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {r.solutionLabel || r.solutionSlug ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand ring-1 ring-inset ring-brand-100 whitespace-nowrap">
                          {r.solutionLabel || r.solutionSlug}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-64">
                      {r.programs?.length ? (
                        <span className="block truncate" title={r.programs.map((p) => p.title).join(", ")}>
                          {r.programs[0].title}
                          {r.programs.length > 1 && (
                            <span className="text-slate-400 font-medium"> +{r.programs.length - 1}</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-700 whitespace-nowrap">
                      {formatMoney(r.totalAmountCents, r.currency)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {formatDate(r.createdAt)}
                    </td>
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

function DetailDrawer({
  summary,
  detail,
  loading,
  error,
  savingStatus,
  onChangeStatus,
  onClose,
}) {
  const d = detail || summary;
  const phone =
    d.phoneNumber || d.phone
      ? `${d.phoneDialCode || ""} ${d.phoneNumber || d.phone || ""}`.trim()
      : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-100">
          <div>
            <p className="font-mono text-xs text-slate-400">{d.referenceNo}</p>
            <h3 className="text-lg font-bold text-slate-800 mt-0.5">
              {d.firstName} {d.lastName || ""}
            </h3>
            <div className="mt-2">
              <StatusBadge status={d.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600"
          >
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
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1.5">
              Update status
            </p>
            <select
              value={d.status || ""}
              disabled={savingStatus}
              onChange={(e) => onChangeStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand disabled:opacity-60"
            >
              {REGISTRATION_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {savingStatus && (
              <p className="text-xs text-slate-400 mt-1">Saving…</p>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading details…</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" value={d.email} />
                <Field label="Phone" value={phone} />
                <Field label="Country" value={d.country} />
                <Field label="Solution" value={d.solutionLabel || d.solutionSlug} />
                <Field label="Designation" value={d.designation} />
                <Field label="Organisation" value={d.organization} />
                <Field label="Heard via" value={d.hearAboutUs} />
              </div>

              {/* Programmes */}
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                  Programmes
                </p>
                {Array.isArray(d.programs) && d.programs.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    {d.programs.map((p, i) => (
                      <div
                        key={p.slug || i}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm border-b border-slate-50 last:border-0"
                      >
                        <span className="text-slate-700">{p.title || p.slug}</span>
                        <span className="text-slate-400 shrink-0">
                          {formatMoney(p.unitPriceCents, d.currency)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-brand text-white">
                      <span className="text-sm font-bold">Total</span>
                      <span className="text-sm font-extrabold">
                        {d.totalAmountFormatted ||
                          formatMoney(d.totalAmountCents, d.currency)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">—</p>
                )}
              </div>

              {/* Provenance */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Source page" value={d.sourcePage} />
                <Field label="Submitted" value={formatDateTime(d.createdAt)} />
              </div>
              {d.internalNotes && (
                <Field label="Internal notes" value={d.internalNotes} />
              )}
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
