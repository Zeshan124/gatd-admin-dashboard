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
  BookOpen,
} from "lucide-react";
import { parentSolutionsApi, childSolutionsApi, API_BASE } from "@/lib/adminApi";
import { formatDate } from "@/lib/format";
import {
  TextField,
  TextArea,
  NumberField,
  Toggle,
  MediaInput,
  StringListEditor,
  ObjectListEditor,
  Section,
  DrawerShell,
  DeleteDialog,
  slugify,
} from "@/components/admin/cms/FormKit";

const PAGE_SIZE = 25;

function ActiveBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
        active ? "bg-green-50 text-green-700 ring-green-200" : "bg-slate-100 text-slate-500 ring-slate-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-slate-400"}`} />
      {active ? "Active" : "Hidden"}
    </span>
  );
}

export default function ProgramsPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [parents, setParents] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [parent, setParent] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // parent options for the filter + form
  useEffect(() => {
    parentSolutionsApi
      .list({ pageSize: 200, sort: "title" })
      .then((res) => setParents(res.data || []))
      .catch(() => setParents([]));
  }, []);

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
      const res = await childSolutionsApi.list({
        q,
        parent,
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
  }, [q, parent, isActive, page]);

  useEffect(() => {
    load();
  }, [load]);

  const total = meta?.total ?? rows.length;
  const totalPages = meta?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const noParents = parents.length === 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Programs</h2>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? "Loading…" : `${total} program${total === 1 ? "" : "s"} across your solutions`}
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
            disabled={noParents}
            title={noParents ? "Create a Solution first" : undefined}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            New program
          </button>
        </div>
      </div>

      {noParents && !loading && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            You need at least one <strong>Solution</strong> before adding programs. Create one under{" "}
            <a href="/admin/solutions" className="font-semibold underline">Solutions</a>.
          </span>
        </div>
      )}

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
          value={parent}
          onChange={(e) => {
            setParent(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand transition-colors max-w-56"
        >
          <option value="">All solutions</option>
          {parents.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title}
            </option>
          ))}
        </select>
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
            <p className="font-semibold text-slate-700">Couldn&apos;t load programs</p>
            <p className="text-sm text-slate-500 max-w-md">{error}</p>
            <p className="text-xs text-slate-400 mt-1">API: {API_BASE}</p>
            <button onClick={load} className="mt-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark">
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading programs…</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Inbox className="w-8 h-8 text-slate-300" />
            <p className="font-semibold text-slate-600">No programs found</p>
            <p className="text-sm text-slate-400">
              {q || parent || isActive ? "Try adjusting your filters." : "Create your first program."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 font-semibold">Title</th>
                  <th className="px-5 py-3 font-semibold">Solution</th>
                  <th className="px-5 py-3 font-semibold">Subprograms</th>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Visibility</th>
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
                      <p className="font-semibold text-slate-800">{r.title}</p>
                      <p className="text-xs text-slate-400 font-mono">/{r.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{r.parentSlug || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        {r.programCount ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{r.sortOrder}</td>
                    <td className="px-5 py-3.5">
                      <ActiveBadge active={r.isActive} />
                    </td>
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
        <ProgramFormDrawer
          editing={editing}
          parents={parents}
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
          description="This hides the program (and, if you confirm, its subprograms) from the public site. Soft delete — re-creatable later."
          onConfirm={(cascade) => childSolutionsApi.remove(deleteTarget.slug, { cascade })}
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

function nn(v) {
  const t = (v ?? "").toString().trim();
  return t ? t : null;
}

function ProgramFormDrawer({ editing, parents, onClose, onSaved }) {
  const isEdit = !!editing;
  const [parentSlug, setParentSlug] = useState(editing?.parentSlug || "");
  const [title, setTitle] = useState(editing?.title || "");
  const [slug, setSlug] = useState(editing?.slug || "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(editing?.description || "");
  const [eyebrow, setEyebrow] = useState(editing?.eyebrow || "");
  const [subheading, setSubheading] = useState(editing?.subheading || "");
  const [subtext, setSubtext] = useState(editing?.subtext || "");

  const [banner, setBanner] = useState(editing?.banner || null);
  const [cardImage, setCardImage] = useState(editing?.cardImage || null);
  const [mapImage, setMapImage] = useState(editing?.mapImage || null);
  const [whyImage, setWhyImage] = useState(editing?.whyImage || null);
  const [audienceImage, setAudienceImage] = useState(editing?.audienceImage || null);
  const [brochure, setBrochure] = useState(editing?.brochure || null);

  const [programmesHeading, setProgrammesHeading] = useState(editing?.programmesHeading || "");
  const [gainsHeading, setGainsHeading] = useState(editing?.gainsHeading || "");
  const [gains, setGains] = useState(Array.isArray(editing?.gains) ? editing.gains : []);
  const [whyHeading, setWhyHeading] = useState(editing?.whyHeading || "");
  const [whyBadge, setWhyBadge] = useState(editing?.whyBadge || "");
  const [audienceBadge, setAudienceBadge] = useState(editing?.audienceBadge || "");
  const [audienceHeading, setAudienceHeading] = useState(editing?.audienceHeading || "");
  const [audience, setAudience] = useState(Array.isArray(editing?.audience) ? editing.audience : []);
  const [rating, setRating] = useState(editing?.rating != null ? String(editing.rating) : "");
  const [reviews, setReviews] = useState(editing?.reviews != null ? String(editing.reviews) : "");
  const [ratingEnabled, setRatingEnabled] = useState(editing?.ratingEnabled ?? true);
  const [sortOrder, setSortOrder] = useState(editing?.sortOrder != null ? String(editing.sortOrder) : "0");
  const [active, setActive] = useState(editing?.isActive ?? true);
  const [clickable, setClickable] = useState(editing?.isClickable ?? true);
  const [linkUrl, setLinkUrl] = useState(editing?.linkUrl || "");

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
      parentSlug,
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      eyebrow: nn(eyebrow),
      subheading: nn(subheading),
      subtext: nn(subtext),
      banner: banner || null,
      cardImage: cardImage || null,
      mapImage: mapImage || null,
      whyImage: whyImage || null,
      audienceImage: audienceImage || null,
      brochure: brochure || null,
      programmesHeading: nn(programmesHeading),
      gainsHeading: nn(gainsHeading),
      gains: gains
        .filter((g) => g && g.text && g.text.trim())
        .map((g) => (g.iconSrc && g.iconSrc.trim() ? { text: g.text.trim(), iconSrc: g.iconSrc.trim() } : { text: g.text.trim() })),
      whyHeading: nn(whyHeading),
      whyBadge: nn(whyBadge),
      audienceBadge: nn(audienceBadge),
      audienceHeading: nn(audienceHeading),
      audience: audience.filter((s) => s && s.trim()).map((s) => s.trim()),
      sortOrder: Number(sortOrder) || 0,
      isActive: active,
      ratingEnabled,
      isClickable: clickable,
      linkUrl: clickable ? nn(linkUrl) : null,
    };
    if (rating !== "") body.rating = Number(rating);
    if (reviews !== "") body.reviews = Number(reviews);

    try {
      if (isEdit) await childSolutionsApi.update(editing.slug, body);
      else await childSolutionsApi.create(body);
      onSaved();
    } catch (e) {
      const fields = e?.body?.error?.fields;
      if (fields && typeof fields === "object") setFe(fields);
      setError(e.message || "Could not save the program.");
      setSaving(false);
    }
  };

  const canSave = parentSlug && title.trim() && slug.trim() && description.trim();

  return (
    <DrawerShell
      subtitle={isEdit ? "Edit program" : "New program"}
      title={isEdit ? editing.title : "Create a program"}
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
            {isEdit ? "Save changes" : "Create program"}
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

      <Section title="Basics">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Parent solution <span className="text-red-500">*</span>
          </span>
          <select
            value={parentSlug}
            onChange={(e) => setParentSlug(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand mt-1.5 bg-white"
          >
            <option value="">Select a solution…</option>
            {parents.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
          </select>
          {fe.parentSlug && <p className="text-xs text-red-600 mt-1">{fe.parentSlug}</p>}
        </label>

        <TextField label="Title" required value={title} onChange={setTitle} error={fe.title} placeholder="e.g. Strategic Human Resources" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 font-mono whitespace-nowrap pt-6">/solutions/…/</span>
          <div className="flex-1">
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
              placeholder="strategic-hr"
            />
          </div>
        </div>
        <TextArea label="Description" required value={description} onChange={setDescription} error={fe.description} />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Eyebrow" value={eyebrow} onChange={setEyebrow} placeholder="Small label above the title" />
          <TextField label="Programmes heading" value={programmesHeading} onChange={setProgrammesHeading} />
        </div>
        <TextField label="Subheading" value={subheading} onChange={setSubheading} />
        <TextArea label="Subtext" value={subtext} onChange={setSubtext} rows={2} />
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Sort order" min={0} value={sortOrder} onChange={setSortOrder} hint="Lower shows first." />
          <Toggle label="Visibility" value={active} onChange={setActive} />
        </div>
      </Section>

      <Section title="Catalog card" description="Controls this program's card on the public /solutions page.">
        <div className="grid grid-cols-2 gap-4">
          <Toggle label="Clickable card" value={clickable} onChange={setClickable} onText="Clickable" offText="Not clickable" />
          <TextField
            label="Link URL (optional)"
            value={linkUrl}
            onChange={setLinkUrl}
            placeholder={`/solutions/${slug || "…"}`}
            hint="Leave blank to link to this program's own page. Ignored when not clickable."
          />
        </div>
      </Section>

      <Section title="Hero & media" description="Upload images/PDF or paste a URL.">
        <div className="grid grid-cols-2 gap-4">
          <MediaInput label="Banner" value={banner} onChange={setBanner} />
          <MediaInput label="Card image" value={cardImage} onChange={setCardImage} />
          <MediaInput label="Map image" value={mapImage} onChange={setMapImage} />
          <MediaInput label="Brochure (PDF)" kind="pdf" value={brochure} onChange={setBrochure} />
        </div>
      </Section>

      <Section title="What you'll gain">
        <TextField label="Gains heading" value={gainsHeading} onChange={setGainsHeading} />
        <ObjectListEditor
          label="Gains"
          value={gains}
          onChange={setGains}
          addLabel="Add gain"
          labeledFields
          fields={[
            { key: "text", label: "Gain text", type: "textarea" },
            { key: "iconSrc", label: "Icon (optional)", type: "image" },
          ]}
        />
      </Section>

      <Section title="Why it's worth it">
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Why heading" value={whyHeading} onChange={setWhyHeading} />
          <TextField label="Why badge" value={whyBadge} onChange={setWhyBadge} />
          <MediaInput label="Why image" value={whyImage} onChange={setWhyImage} />
        </div>
      </Section>

      <Section title="Who it's for">
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Audience badge" value={audienceBadge} onChange={setAudienceBadge} />
          <TextField label="Audience heading" value={audienceHeading} onChange={setAudienceHeading} />
          <MediaInput label="Audience image" value={audienceImage} onChange={setAudienceImage} />
        </div>
        <StringListEditor label="Audience list" value={audience} onChange={setAudience} placeholder="e.g. HR Business Partners" />
      </Section>

      <Section title="Ratings">
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Rating (0–5)" min={0} max={5} step="0.1" value={rating} onChange={setRating} error={fe.rating} />
          <NumberField label="Reviews count" min={0} value={reviews} onChange={setReviews} error={fe.reviews} />
        </div>
        <Toggle
          label="Show rating on website"
          value={ratingEnabled}
          onChange={setRatingEnabled}
          onText="Shown"
          offText="Hidden"
        />
      </Section>
    </DrawerShell>
  );
}
