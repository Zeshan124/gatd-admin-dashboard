"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  X,
  AlertTriangle,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Loader2,
  Layers,
  Check,
} from "lucide-react";
import { parentSolutionsApi, API_BASE } from "@/lib/adminApi";
import { MediaInput } from "@/components/admin/cms/FormKit";
import { formatDate } from "@/lib/format";

const PAGE_SIZE = 25;

/** Client-side slug preview (backend re-validates/derives on save). */
function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function ActiveBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
        active
          ? "bg-green-50 text-green-700 ring-green-200"
          : "bg-slate-100 text-slate-500 ring-slate-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-slate-400"}`} />
      {active ? "Active" : "Hidden"}
    </span>
  );
}

export default function SolutionsPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);

  // create/edit drawer
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create, else the row

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

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
      const res = await parentSolutionsApi.list({
        q,
        isActive,
        page,
        pageSize: PAGE_SIZE,
        sort: "sort_order",
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
  }, [q, isActive, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setFormOpen(true);
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
          <h2 className="text-2xl font-extrabold text-slate-800">Solutions</h2>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? "Loading…" : `${total} top-level solution${total === 1 ? "" : "s"}`}
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
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            New solution
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 flex-1 min-w-56 focus-within:border-brand transition-colors">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search title or slug…"
            className="bg-transparent outline-none text-sm w-full text-slate-700 placeholder-slate-400"
          />
          {searchInput && (
            <button onClick={() => setSearchInput("")} aria-label="Clear search">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <select
          value={isActive}
          onChange={(e) => {
            setIsActive(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand transition-colors"
        >
          <option value="">All visibility</option>
          <option value="true">Active</option>
          <option value="false">Hidden</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <p className="font-semibold text-slate-700">Couldn&apos;t load solutions</p>
            <p className="text-sm text-slate-500 max-w-md">{error}</p>
            <p className="text-xs text-slate-400 mt-1">API: {API_BASE}</p>
            <button onClick={load} className="mt-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark">
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading solutions…</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Inbox className="w-8 h-8 text-slate-300" />
            <p className="font-semibold text-slate-600">No solutions yet</p>
            <p className="text-sm text-slate-400">
              {q || isActive ? "Try adjusting your filters." : "Create your first solution to get started."}
            </p>
            {!q && !isActive && (
              <button onClick={openCreate} className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark">
                <Plus className="w-4 h-4" /> New solution
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 font-semibold">Title</th>
                  <th className="px-5 py-3 font-semibold">Programs</th>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Visibility</th>
                  <th className="px-5 py-3 font-semibold">Updated</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => openEdit(r)}
                    className="hover:bg-brand-50/60 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{r.title}</p>
                      <p className="text-xs text-slate-400 font-mono">/{r.slug}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <Layers className="w-4 h-4 text-slate-400" />
                        {r.childCount ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{r.sortOrder}</td>
                    <td className="px-5 py-3.5">
                      <ActiveBadge active={r.isActive} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{formatDate(r.updatedAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(r);
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-brand hover:bg-brand-50 transition-colors"
                          aria-label={`Edit ${r.title}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(r);
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label={`Delete ${r.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {formOpen && (
        <SolutionFormDrawer
          editing={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            load();
          }}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            load();
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────── Create / edit drawer ─────────────────────────── */

function SolutionFormDrawer({ editing, onClose, onSaved }) {
  const isEdit = !!editing;
  const [title, setTitle] = useState(editing?.title || "");
  const [slug, setSlug] = useState(editing?.slug || "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(editing?.description || "");
  const [sortOrder, setSortOrder] = useState(
    editing?.sortOrder != null ? String(editing.sortOrder) : "0"
  );
  const [active, setActive] = useState(editing?.isActive ?? true);
  const [clickable, setClickable] = useState(editing?.isClickable ?? true);

  // Individual Solution page content (hero + middle section).
  const [eyebrow, setEyebrow] = useState(editing?.eyebrow || "");
  const [banner, setBanner] = useState(editing?.banner || null);
  const [middleImage, setMiddleImage] = useState(editing?.middleImage || null);
  const [middleBadge, setMiddleBadge] = useState(editing?.middleBadge || "");
  const [middleHeading, setMiddleHeading] = useState(editing?.middleHeading || "");
  const [middleBody, setMiddleBody] = useState(editing?.middleBody || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Keep slug in sync with the title until the user edits it manually.
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const save = async () => {
    setSaving(true);
    setError("");
    setFieldErrors({});
    const body = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      eyebrow: eyebrow.trim() || null,
      banner: banner || null,
      middleImage: middleImage || null,
      middleBadge: middleBadge.trim() || null,
      middleHeading: middleHeading.trim() || null,
      middleBody: middleBody.trim() || null,
      sortOrder: Number(sortOrder) || 0,
      isActive: active,
      isClickable: clickable,
    };
    try {
      if (isEdit) await parentSolutionsApi.update(editing.slug, body);
      else await parentSolutionsApi.create(body);
      onSaved();
    } catch (e) {
      const fe = e?.body?.error?.fields;
      if (fe && typeof fe === "object") setFieldErrors(fe);
      setError(e.message || "Could not save the solution.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400">{isEdit ? "Edit solution" : "New solution"}</span>
            <h3 className="text-lg font-bold text-slate-800 mt-0.5">
              {isEdit ? editing.title : "Create a solution"}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Labeled label="Title" required error={fieldErrors.title}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Certified Programs"
              className="form-input"
            />
          </Labeled>

          <Labeled
            label="Slug"
            required
            error={fieldErrors.slug}
            hint="Used in the URL. Lower-case letters, numbers and hyphens."
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 font-mono">/solutions/</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="certified-programs"
                className="form-input font-mono"
              />
            </div>
          </Labeled>

          <Labeled label="Description" error={fieldErrors.description}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Short summary shown on the solutions listing."
              className="form-input resize-y"
            />
          </Labeled>

          <div className="grid grid-cols-2 gap-4">
            <Labeled label="Sort order" error={fieldErrors.sortOrder} hint="Lower shows first.">
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="form-input"
              />
            </Labeled>
            <Labeled label="Visibility">
              <button
                type="button"
                onClick={() => setActive((v) => !v)}
                className={`mt-1.5 inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold transition-colors w-full justify-center ${
                  active
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-slate-300 bg-slate-50 text-slate-500"
                }`}
              >
                {active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {active ? "Active (public)" : "Hidden"}
              </button>
            </Labeled>
          </div>

          <Labeled label="Clickable in menu" hint="When off, the header category shows as plain text (hover still reveals its Programs) and its title won't link on the Solutions page.">
            <button
              type="button"
              onClick={() => setClickable((v) => !v)}
              className={`mt-1.5 inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold transition-colors w-full justify-center ${
                clickable
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-slate-300 bg-slate-50 text-slate-500"
              }`}
            >
              {clickable ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {clickable ? "Clickable (opens its page)" : "Not clickable"}
            </button>
          </Labeled>

          {/* ── Individual Solution page content ─────────────────────────── */}
          <div className="pt-3 mt-1 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Solution page</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Shown when this Solution opens as its own page: hero, a middle section (left image + right content), then its Programs.
            </p>
          </div>

          <Labeled label="Hero eyebrow" hint='Small label above the title. Defaults to "Our Solutions".'>
            <input
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              placeholder="Our Solutions"
              className="form-input"
            />
          </Labeled>

          <MediaInput label="Hero banner" value={banner} onChange={setBanner} />

          <MediaInput label="Middle section image (left)" value={middleImage} onChange={setMiddleImage} />

          <Labeled label="Middle section badge" hint="Small pill shown above the middle heading.">
            <input
              value={middleBadge}
              onChange={(e) => setMiddleBadge(e.target.value)}
              placeholder="e.g. Advance your expertise."
              className="form-input"
            />
          </Labeled>

          <Labeled label="Middle section heading">
            <input
              value={middleHeading}
              onChange={(e) => setMiddleHeading(e.target.value)}
              placeholder="e.g. Earn your certification with GATD"
              className="form-input"
            />
          </Labeled>

          <Labeled label="Middle section content" hint="Right-side paragraphs. Leave a blank line between paragraphs.">
            <textarea
              value={middleBody}
              onChange={(e) => setMiddleBody(e.target.value)}
              rows={6}
              placeholder={"First paragraph…\n\nSecond paragraph…"}
              className="form-input resize-y"
            />
          </Labeled>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !title.trim() || !slug.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create solution"}
          </button>
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
      <style jsx global>{`
        .form-input {
          width: 100%;
          border: 1px solid rgb(203 213 225);
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(30 41 59);
          outline: none;
          margin-top: 0.375rem;
        }
        .form-input:focus {
          border-color: var(--color-brand, #b91c1c);
        }
      `}</style>
    </div>
  );
}

function Labeled({ label, required, hint, error, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </label>
  );
}

/* ───────────────────────────── Delete dialog ──────────────────────────────── */

function DeleteDialog({ target, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [needsCascade, setNeedsCascade] = useState(false);

  const doDelete = async (cascade) => {
    setDeleting(true);
    setError("");
    try {
      await parentSolutionsApi.remove(target.slug, { cascade });
      onDeleted();
    } catch (e) {
      if (e?.body?.error?.code === "HAS_CHILDREN") {
        setNeedsCascade(true);
        setError(e.message);
      } else {
        setError(e.message || "Could not delete.");
      }
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800">Delete “{target.title}”?</h3>
            <p className="text-sm text-slate-500 mt-1">
              This hides it from the public site (soft delete). You can re-create it later.
            </p>
            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={() => doDelete(needsCascade)}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-60"
          >
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {needsCascade ? "Delete it and its programs" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
