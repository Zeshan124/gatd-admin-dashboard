"use client";

import { useCallback, useEffect, useState } from "react";
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
  Eye,
  EyeOff,
  Star,
} from "lucide-react";
import { blogsApi, API_BASE } from "@/lib/adminApi";
import { formatDate } from "@/lib/format";
import {
  TextField,
  TextArea,
  NumberField,
  Toggle,
  MediaInput,
  StringListEditor,
  Labeled,
  Section,
  DrawerShell,
  DeleteDialog,
  slugify,
  inputCls,
} from "@/components/admin/cms/FormKit";
import dynamic from "next/dynamic";

// CKEditor is browser-only; load it client-side to avoid SSR/static-export issues.
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="mt-1.5 h-64 rounded-lg border border-slate-200 bg-slate-50 animate-pulse" />,
});

const PAGE_SIZE = 25;

function nn(v) {
  const t = (v ?? "").toString().trim();
  return t ? t : null;
}
function toDateInput(iso) {
  return iso ? String(iso).slice(0, 10) : "";
}

function PubBadge({ published }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
        published ? "bg-green-50 text-green-700 ring-green-200" : "bg-amber-50 text-amber-700 ring-amber-200"
      }`}
    >
      {published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      {published ? "Published" : "Draft"}
    </span>
  );
}

export default function BlogPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [isPublished, setIsPublished] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
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
      const res = await blogsApi.list({ q, isPublished, page, pageSize: PAGE_SIZE, sort: "-published_at" });
      setRows(res.data || []);
      setMeta(res.meta || null);
    } catch (e) {
      setError(e.message);
      setRows([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [q, isPublished, page]);

  useEffect(() => {
    load();
  }, [load]);

  const total = meta?.total ?? rows.length;
  const totalPages = meta?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Blog</h2>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? "Loading…" : `${total} post${total === 1 ? "" : "s"}`}
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
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            New post
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
            placeholder="Search title, slug or category…"
            className="bg-transparent outline-none text-sm w-full text-slate-700 placeholder-slate-400"
          />
          {searchInput && (
            <button onClick={() => setSearchInput("")} aria-label="Clear search">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <select
          value={isPublished}
          onChange={(e) => {
            setIsPublished(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand transition-colors"
        >
          <option value="">All states</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <p className="font-semibold text-slate-700">Couldn&apos;t load posts</p>
            <p className="text-sm text-slate-500 max-w-md">{error}</p>
            <p className="text-xs text-slate-400 mt-1">API: {API_BASE}</p>
            <button onClick={load} className="mt-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark">
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading posts…</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Inbox className="w-8 h-8 text-slate-300" />
            <p className="font-semibold text-slate-600">No posts yet</p>
            <p className="text-sm text-slate-400">{q || isPublished ? "Try adjusting your filters." : "Write your first blog post."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 font-semibold">Title</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">State</th>
                  <th className="px-5 py-3 font-semibold">Published</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => {
                      setEditing(r);
                      setFormOpen(true);
                    }}
                    className="hover:bg-brand-50/60 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                        {r.isFeatured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
                        {r.title}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">/blog/{r.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{r.category || <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-3.5">
                      <PubBadge published={r.isPublished} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{r.publishedAt ? formatDate(r.publishedAt) : "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditing(r);
                            setFormOpen(true);
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

        {!error && !loading && rows.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold">{from}</span>–<span className="font-semibold">{to}</span> of{" "}
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
        <BlogFormDrawer
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
          title={`Delete “${deleteTarget.title}”?`}
          description="This removes the post from the public blog (soft delete). You can re-create it later."
          onConfirm={() => blogsApi.remove(deleteTarget.slug)}
          onClose={() => {
            setDeleteTarget(null);
            load();
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────── Create / edit drawer ─────────────────────────── */

function BlogFormDrawer({ editing, onClose, onSaved }) {
  const isEdit = !!editing;

  const [title, setTitle] = useState(editing?.title || "");
  const [slug, setSlug] = useState(editing?.slug || "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(editing?.excerpt || "");
  const [content, setContent] = useState(editing?.content || "");
  const [coverImage, setCoverImage] = useState(editing?.coverImage || null);
  const [category, setCategory] = useState(editing?.category || "");
  const [tags, setTags] = useState(Array.isArray(editing?.tags) ? editing.tags : []);
  const [authorName, setAuthorName] = useState(editing?.authorName || "");
  const [authorImage, setAuthorImage] = useState(editing?.authorImage || null);
  const [readMinutes, setReadMinutes] = useState(editing?.readMinutes != null ? String(editing.readMinutes) : "");
  const [views, setViews] = useState(editing?.views != null ? String(editing.views) : "");
  const [publishedAt, setPublishedAt] = useState(toDateInput(editing?.publishedAt));
  const [isFeatured, setIsFeatured] = useState(editing?.isFeatured ?? false);
  const [isPublished, setIsPublished] = useState(editing?.isPublished ?? true);
  const [sortOrder, setSortOrder] = useState(editing?.sortOrder != null ? String(editing.sortOrder) : "0");
  const [metaTitle, setMetaTitle] = useState(editing?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(editing?.metaDescription || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fe, setFe] = useState({});

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const save = async () => {
    setSaving(true);
    setError("");
    setFe({});
    const body = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: nn(excerpt),
      coverImage: coverImage || null,
      category: nn(category),
      tags: tags.filter((t) => t && t.trim()).map((t) => t.trim()),
      authorName: nn(authorName),
      authorImage: authorImage || null,
      readMinutes: readMinutes === "" ? null : Number(readMinutes),
      views: views === "" ? 0 : Number(views),
      publishedAt: publishedAt || null,
      isFeatured,
      isPublished,
      sortOrder: Number(sortOrder) || 0,
      metaTitle: nn(metaTitle),
      metaDescription: nn(metaDescription),
    };
    try {
      if (isEdit) await blogsApi.update(editing.slug, body);
      else await blogsApi.create(body);
      onSaved();
    } catch (e) {
      const fields = e?.body?.error?.fields;
      if (fields && typeof fields === "object") setFe(fields);
      setError(e.message || "Could not save the post.");
      setSaving(false);
    }
  };

  const canSave = title.trim() && slug.trim() && content.trim();

  return (
    <DrawerShell
      subtitle={isEdit ? "Edit post" : "New post"}
      title={isEdit ? editing.title : "Write a post"}
      width="max-w-3xl"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} disabled={saving} className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !canSave}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create post"}
          </button>
        </>
      }
    >
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Section title="Content">
        <TextField label="Title" required value={title} onChange={setTitle} error={fe.title} />
        <TextField
          label="Slug"
          required
          mono
          value={slug}
          onChange={(v) => {
            setSlugTouched(true);
            setSlug(v);
          }}
          error={fe.slug}
          hint="URL: /blog/your-slug"
        />
        <TextArea label="Excerpt" value={excerpt} onChange={setExcerpt} rows={2} hint="Short summary shown on cards and previews." />
        <Labeled label="Body" required error={fe.content} hint="Full rich-text editor — formatting, images, tables, embeds. Stored as HTML.">
          <div className="mt-1.5">
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </Labeled>
      </Section>

      <Section title="Media & author">
        <div className="grid grid-cols-2 gap-4">
          <MediaInput label="Cover image" value={coverImage} onChange={setCoverImage} />
          <MediaInput label="Author photo" value={authorImage} onChange={setAuthorImage} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <TextField label="Author name" value={authorName} onChange={setAuthorName} />
          <NumberField label="Read time (minutes)" min={0} value={readMinutes} onChange={setReadMinutes} error={fe.readMinutes} />
          <NumberField label="Views" min={0} value={views} onChange={setViews} error={fe.views} hint="Shown on blog cards." />
        </div>
      </Section>

      <Section title="Taxonomy">
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Category" value={category} onChange={setCategory} placeholder="e.g. Leadership" />
        </div>
        <StringListEditor label="Tags" value={tags} onChange={setTags} placeholder="e.g. HR" />
      </Section>

      <Section title="Publishing">
        <div className="grid grid-cols-3 gap-4">
          <Labeled label="Publish date">
            <input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={`${inputCls} mt-1.5`} />
          </Labeled>
          <Toggle label="Status" value={isPublished} onChange={setIsPublished} onText="Published" offText="Draft" />
          <Toggle label="Featured" value={isFeatured} onChange={setIsFeatured} onText="Featured" offText="Normal" />
        </div>
        <NumberField label="Sort order" min={0} value={sortOrder} onChange={setSortOrder} error={fe.sortOrder} hint="Used when sorting manually; the public list defaults to newest first." />
      </Section>

      <Section title="SEO (optional)">
        <TextField label="Meta title" value={metaTitle} onChange={setMetaTitle} />
        <TextArea label="Meta description" value={metaDescription} onChange={setMetaDescription} rows={2} />
      </Section>
    </DrawerShell>
  );
}
