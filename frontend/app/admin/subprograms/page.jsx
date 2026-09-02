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
} from "lucide-react";
import { childSolutionsApi, solutionProgramsApi, API_BASE } from "@/lib/adminApi";
import {
  TextField,
  TextArea,
  NumberField,
  Toggle,
  MediaInput,
  ObjectListEditor,
  JsonField,
  Section,
  DrawerShell,
  DeleteDialog,
  slugify,
  inputCls,
} from "@/components/admin/cms/FormKit";

const PAGE_SIZE = 25;

const LAYOUT_TYPES = [
  { value: "", label: "None" },
  { value: "strategic_pillars", label: "Strategic pillars (default)" },
  { value: "precision_pillars", label: "Precision pillars" },
  { value: "people_strategy_panels", label: "People strategy panels" },
  { value: "learning_journey", label: "Learning journey" },
  { value: "org_framework", label: "Org framework" },
  { value: "session_plan", label: "Session plan" },
  { value: "curriculum", label: "Curriculum" },
  { value: "hexagons", label: "Hexagons" },
];

function nn(v) {
  const t = (v ?? "").toString().trim();
  return t ? t : null;
}
function parseMaybeJson(text) {
  const t = (text || "").trim();
  if (!t) return { ok: true, value: null };
  try {
    return { ok: true, value: JSON.parse(t) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
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

export default function SubprogramsPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [children, setChildren] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [childSolution, setChildSolution] = useState("");
  const [isPublished, setIsPublished] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    childSolutionsApi
      .list({ pageSize: 500, sort: "title" })
      .then((res) => setChildren(res.data || []))
      .catch(() => setChildren([]));
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
      const res = await solutionProgramsApi.list({
        q,
        childSolution,
        isPublished,
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
  }, [q, childSolution, isPublished, page]);

  useEffect(() => {
    load();
  }, [load]);

  const total = meta?.total ?? rows.length;
  const totalPages = meta?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const noChildren = children.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Subprograms</h2>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? "Loading…" : `${total} subprogram detail page${total === 1 ? "" : "s"}`}
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
            disabled={noChildren}
            title={noChildren ? "Create a Program first" : undefined}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            New subprogram
          </button>
        </div>
      </div>

      {noChildren && !loading && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            You need at least one <strong>Program</strong> first. Add one under{" "}
            <a href="/admin/programs" className="font-semibold underline">Programs</a>.
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
          value={childSolution}
          onChange={(e) => {
            setChildSolution(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand transition-colors max-w-56"
        >
          <option value="">All programs</option>
          {children.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </select>
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
            <p className="font-semibold text-slate-700">Couldn&apos;t load subprograms</p>
            <p className="text-sm text-slate-500 max-w-md">{error}</p>
            <p className="text-xs text-slate-400 mt-1">API: {API_BASE}</p>
            <button onClick={load} className="mt-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark">
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading subprograms…</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Inbox className="w-8 h-8 text-slate-300" />
            <p className="font-semibold text-slate-600">No subprograms found</p>
            <p className="text-sm text-slate-400">
              {q || childSolution || isPublished ? "Try adjusting your filters." : "Create your first subprogram."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 font-semibold">Title</th>
                  <th className="px-5 py-3 font-semibold">Program</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">State</th>
                  <th className="px-5 py-3 font-semibold">Order</th>
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
                    <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{r.childSolutionSlug || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{r.priceFormatted || "—"}</td>
                    <td className="px-5 py-3.5">
                      <PubBadge published={r.isPublished} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{r.sortOrder}</td>
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
        <SubprogramFormDrawer
          editing={editing}
          programs={children}
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
          description="This hides the subprogram detail page from the public site. Soft delete — re-creatable later."
          onConfirm={() => solutionProgramsApi.remove(deleteTarget.slug)}
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

function SubprogramFormDrawer({ editing, programs, onClose, onSaved }) {
  const isEdit = !!editing;

  const [childSolutionSlug, setChildSolutionSlug] = useState(editing?.childSolutionSlug || "");
  const [title, setTitle] = useState(editing?.title || "");
  const [slug, setSlug] = useState(editing?.slug || "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(editing?.description || "");
  const [eyebrow, setEyebrow] = useState(editing?.eyebrow || "");
  const [subheading, setSubheading] = useState(editing?.subheading || "");
  const [subtext, setSubtext] = useState(editing?.subtext || "");

  const [banner, setBanner] = useState(editing?.banner || null);
  const [cardImage, setCardImage] = useState(editing?.cardImage || null);
  const [brochure, setBrochure] = useState(editing?.brochure || null);

  // pricing (price shown in major units, stored as cents)
  const [price, setPrice] = useState(editing?.priceCents != null ? String(editing.priceCents / 100) : "");
  const [currency, setCurrency] = useState(editing?.currency || "SGD");
  const [pricingPeriod, setPricingPeriod] = useState(editing?.pricingPeriod || "");
  const [pricingHeading, setPricingHeading] = useState(editing?.pricingHeading || "");
  const [pricingDescription, setPricingDescription] = useState(editing?.pricingDescription || "");

  const [overviewTitle, setOverviewTitle] = useState(editing?.overview?.title || "");
  const [overviewDescription, setOverviewDescription] = useState(editing?.overview?.description || "");
  const [overviewImage, setOverviewImage] = useState(editing?.overview?.image || null);

  const [gainsHeading, setGainsHeading] = useState(editing?.gainsHeading || "");
  const [gains, setGains] = useState(Array.isArray(editing?.gains) ? editing.gains : []);
  const [focusHeading, setFocusHeading] = useState(editing?.focusHeading || "");
  const [focusAreas, setFocusAreas] = useState(Array.isArray(editing?.focusAreas) ? editing.focusAreas : []);
  const [faqs, setFaqs] = useState(Array.isArray(editing?.faqs) ? editing.faqs : []);
  const [registrationHeading, setRegistrationHeading] = useState(editing?.registrationHeading || "");

  const [rating, setRating] = useState(editing?.rating != null ? String(editing.rating) : "");
  const [reviews, setReviews] = useState(editing?.reviews != null ? String(editing.reviews) : "");
  const [sortOrder, setSortOrder] = useState(editing?.sortOrder != null ? String(editing.sortOrder) : "0");
  const [active, setActive] = useState(editing?.isActive ?? true);
  const [published, setPublished] = useState(editing?.isPublished ?? true);
  const [clickable, setClickable] = useState(editing?.isClickable ?? true);
  const [linkUrl, setLinkUrl] = useState(editing?.linkUrl || "");

  // JSON sections stored as raw text; parsed at save.
  const stringifyOrEmpty = (v) => (v == null ? "" : JSON.stringify(v, null, 2));
  const [facilitatorText, setFacilitatorText] = useState(stringifyOrEmpty(editing?.facilitator));
  const [certificationText, setCertificationText] = useState(stringifyOrEmpty(editing?.certification));
  const [layoutType, setLayoutType] = useState(editing?.layoutType || "");
  const [layoutDataText, setLayoutDataText] = useState(stringifyOrEmpty(editing?.layoutData));

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

    // Parse the JSON sections up-front so we can abort cleanly.
    const fac = parseMaybeJson(facilitatorText);
    const cert = parseMaybeJson(certificationText);
    const layout = parseMaybeJson(layoutDataText);
    if (!fac.ok) return abort("Facilitator JSON is invalid: " + fac.error);
    if (!cert.ok) return abort("Certification JSON is invalid: " + cert.error);
    if (!layout.ok) return abort("Curriculum (layout) JSON is invalid: " + layout.error);
    if (layoutType && layout.value == null) {
      return abort('A curriculum layout is selected, so "Curriculum data (JSON)" is required.');
    }

    const body = {
      childSolutionSlug,
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      eyebrow: nn(eyebrow),
      subheading: nn(subheading),
      subtext: nn(subtext),
      banner: banner || null,
      cardImage: cardImage || null,
      brochure: brochure || null,
      currency: (currency || "SGD").toUpperCase(),
      pricingPeriod: nn(pricingPeriod),
      pricingHeading: nn(pricingHeading),
      pricingDescription: nn(pricingDescription),
      gainsHeading: nn(gainsHeading),
      focusHeading: nn(focusHeading),
      registrationHeading: nn(registrationHeading),
      gains: gains
        .filter((g) => g && g.text && g.text.trim())
        .map((g) => (g.iconSrc && g.iconSrc.trim() ? { text: g.text.trim(), iconSrc: g.iconSrc.trim() } : { text: g.text.trim() })),
      focusAreas: focusAreas
        .filter((f) => f && f.title && f.title.trim() && f.description && f.description.trim())
        .map((f) => (f.iconSrc && f.iconSrc.trim() ? { title: f.title.trim(), description: f.description.trim(), iconSrc: f.iconSrc.trim() } : { title: f.title.trim(), description: f.description.trim() })),
      faqs: faqs
        .filter((f) => f && f.question && f.question.trim() && f.answer && f.answer.trim())
        .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
      overview:
        overviewTitle.trim() && overviewDescription.trim()
          ? { title: overviewTitle.trim(), description: overviewDescription.trim(), ...(overviewImage ? { image: overviewImage } : {}) }
          : null,
      facilitator: fac.value,
      certification: cert.value,
      layoutType: layoutType || null,
      layoutData: layout.value,
      sortOrder: Number(sortOrder) || 0,
      isActive: active,
      isPublished: published,
      isClickable: clickable,
      linkUrl: clickable ? nn(linkUrl) : null,
    };
    if (price !== "") body.priceCents = Math.round(Number(price) * 100);
    if (rating !== "") body.rating = Number(rating);
    if (reviews !== "") body.reviews = Number(reviews);

    try {
      if (isEdit) await solutionProgramsApi.update(editing.slug, body);
      else await solutionProgramsApi.create(body);
      onSaved();
    } catch (e) {
      const fields = e?.body?.error?.fields;
      if (fields && typeof fields === "object") setFe(fields);
      setError(e.message || "Could not save the subprogram.");
      setSaving(false);
    }
  };

  function abort(msg) {
    setError(msg);
    setSaving(false);
  }

  const canSave = childSolutionSlug && title.trim() && slug.trim() && description.trim();

  return (
    <DrawerShell
      subtitle={isEdit ? "Edit subprogram" : "New subprogram"}
      title={isEdit ? editing.title : "Create a subprogram"}
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
            {isEdit ? "Save changes" : "Create subprogram"}
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
            Program (parent) <span className="text-red-500">*</span>
          </span>
          <select
            value={childSolutionSlug}
            onChange={(e) => setChildSolutionSlug(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand mt-1.5 bg-white"
          >
            <option value="">Select a program…</option>
            {programs.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
          {fe.childSolutionSlug && <p className="text-xs text-red-600 mt-1">{fe.childSolutionSlug}</p>}
        </label>

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
        />
        <TextArea label="Description" required value={description} onChange={setDescription} error={fe.description} />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Eyebrow" value={eyebrow} onChange={setEyebrow} />
          <TextField label="Subheading" value={subheading} onChange={setSubheading} />
        </div>
        <TextArea label="Subtext" value={subtext} onChange={setSubtext} rows={2} />
        <div className="grid grid-cols-3 gap-4">
          <NumberField label="Sort order" min={0} value={sortOrder} onChange={setSortOrder} />
          <Toggle label="Visibility" value={active} onChange={setActive} />
          <Toggle label="Published" value={published} onChange={setPublished} onText="Published" offText="Draft" />
        </div>
      </Section>

      <Section title="Catalog card" description="Controls this subprogram's card on its parent Program page.">
        <div className="grid grid-cols-2 gap-4">
          <Toggle label="Clickable card" value={clickable} onChange={setClickable} onText="Clickable" offText="Not clickable" />
          <TextField
            label="Link URL (optional)"
            value={linkUrl}
            onChange={setLinkUrl}
            placeholder={`/solutions/${childSolutionSlug || "…"}/${slug || "…"}`}
            hint="Leave blank to link to this subprogram's own page (published only)."
          />
        </div>
      </Section>

      <Section title="Hero & media">
        <div className="grid grid-cols-2 gap-4">
          <MediaInput label="Banner" value={banner} onChange={setBanner} />
          <MediaInput label="Card image" value={cardImage} onChange={setCardImage} />
          <MediaInput label="Brochure (PDF)" kind="pdf" value={brochure} onChange={setBrochure} />
        </div>
      </Section>

      <Section title="Pricing">
        <div className="grid grid-cols-3 gap-4">
          <NumberField label="Price" min={0} step="0.01" value={price} onChange={setPrice} error={fe.priceCents} hint="In currency units, e.g. 3850" />
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Currency</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`${inputCls} mt-1.5 bg-white`}>
              {["SGD", "USD", "EUR", "GBP", "MYR", "AUD"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <TextField label="Pricing period" value={pricingPeriod} onChange={setPricingPeriod} placeholder="e.g. per participant" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Pricing heading" value={pricingHeading} onChange={setPricingHeading} />
          <TextField label="Registration heading" value={registrationHeading} onChange={setRegistrationHeading} />
        </div>
        <TextArea label="Pricing description" value={pricingDescription} onChange={setPricingDescription} rows={2} />
      </Section>

      <Section title="Overview">
        <TextField label="Overview title" value={overviewTitle} onChange={setOverviewTitle} />
        <TextArea label="Overview description" value={overviewDescription} onChange={setOverviewDescription} />
        <MediaInput label="Overview image" value={overviewImage} onChange={setOverviewImage} />
      </Section>

      <Section title="What you'll gain">
        <TextField label="Gains heading" value={gainsHeading} onChange={setGainsHeading} />
        <ObjectListEditor
          label="Gains"
          value={gains}
          onChange={setGains}
          addLabel="Add gain"
          itemLabel="Gain"
          labeledFields
          fields={[
            { key: "text", label: "Gain text", type: "textarea", placeholder: "What the participant will gain" },
            { key: "iconSrc", label: "Icon (optional)", type: "image" },
          ]}
        />
      </Section>

      <Section title="Focus areas">
        <TextField label="Focus heading" value={focusHeading} onChange={setFocusHeading} />
        <ObjectListEditor
          label="Focus areas"
          value={focusAreas}
          onChange={setFocusAreas}
          addLabel="Add focus area"
          itemLabel="Focus area"
          labeledFields
          fields={[
            { key: "title", label: "Title", placeholder: "e.g. Strategic HR Alignment" },
            { key: "description", label: "Description", type: "textarea", placeholder: "Short description of this focus area" },
            { key: "iconSrc", label: "Icon (optional)", type: "image" },
          ]}
        />
      </Section>

      <Section title="FAQs" description="Each item is one question and its answer, shown on the public page.">
        <ObjectListEditor
          label="FAQs"
          value={faqs}
          onChange={setFaqs}
          addLabel="Add FAQ"
          itemLabel="FAQ"
          labeledFields
          fields={[
            { key: "question", label: "Question", placeholder: "e.g. Who is this programme for?" },
            { key: "answer", label: "Answer", type: "textarea", placeholder: "The answer visitors will see on the page" },
          ]}
        />
      </Section>

      <Section title="Advanced content" description="These sections have flexible/nested shapes, so they're edited as JSON. Leave blank to omit.">
        <JsonField
          label="Facilitator (JSON)"
          hint='e.g. {"name":"…","role":"…","image":"…","expertise":["…"],"biography":["…"]}'
          value={facilitatorText}
          onChange={setFacilitatorText}
          rows={6}
        />
        <JsonField
          label="Certification (JSON)"
          hint='e.g. {"badge":"…","heading":"…","image":"…","paragraphs":["…"]}'
          value={certificationText}
          onChange={setCertificationText}
          rows={5}
        />
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Curriculum layout</span>
          <select value={layoutType} onChange={(e) => setLayoutType(e.target.value)} className={`${inputCls} mt-1.5 bg-white`}>
            {LAYOUT_TYPES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          {fe.layoutType && <p className="text-xs text-red-600 mt-1">{fe.layoutType}</p>}
        </label>
        <JsonField
          label="Curriculum data (JSON)"
          hint='Required when a layout is selected. Needs at least {"heading":"…","badge":"…","days":[…]}'
          value={layoutDataText}
          onChange={setLayoutDataText}
          rows={8}
          error={fe.layoutData}
        />
      </Section>

      <Section title="Ratings">
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Rating (0–5)" min={0} max={5} step="0.1" value={rating} onChange={setRating} error={fe.rating} />
          <NumberField label="Reviews count" min={0} value={reviews} onChange={setReviews} error={fe.reviews} />
        </div>
      </Section>
    </DrawerShell>
  );
}
