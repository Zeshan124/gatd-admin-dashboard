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
  StringListEditor,
  Section,
  DrawerShell,
  DeleteDialog,
  slugify,
  inputCls,
} from "@/components/admin/cms/FormKit";

const PAGE_SIZE = 25;

const LAYOUT_TYPES = [
  { value: "", label: "None" },
  // These two use the simple day-by-day editor below (recommended).
  { value: "curriculum", label: "Curriculum — day-by-day (simple editor)" },
  { value: "session_plan", label: "Session plan — day-by-day (simple editor)" },
  // Advanced layouts (different visual styles) still edited as JSON.
  { value: "strategic_pillars", label: "Strategic pillars (advanced)" },
  { value: "precision_pillars", label: "Precision pillars (advanced)" },
  { value: "people_strategy_panels", label: "People strategy panels (advanced)" },
  { value: "learning_journey", label: "Learning journey (advanced)" },
  { value: "org_framework", label: "Org framework (advanced)" },
  { value: "hexagons", label: "Hexagons (advanced)" },
];

// Layouts whose data is the simple { days:[{ label, sessions:[{ color,title,bullets }] }] }
// shape handled by the friendly CurriculumEditor. Others keep a JSON fallback.
const SIMPLE_LAYOUTS = new Set(["curriculum", "session_plan"]);

function nn(v) {
  const t = (v ?? "").toString().trim();
  return t ? t : null;
}
function cleanStrList(a) {
  return (Array.isArray(a) ? a : []).map((s) => String(s || "").trim()).filter(Boolean);
}
// Normalize the structured editors' state into the API shapes (or null if empty).
function cleanFacilitatorList(list) {
  const arr = (Array.isArray(list) ? list : list ? [list] : [])
    .filter((f) => f && f.name && f.name.trim())
    .map((f) => ({
      name: f.name.trim(),
      ...(f.role && f.role.trim() ? { role: f.role.trim() } : {}),
      ...(f.image ? { image: f.image } : {}),
      ...(f.bg ? { bg: f.bg } : {}),
      expertise: cleanStrList(f.expertise),
      biography: cleanStrList(f.biography),
    }));
  if (arr.length === 0) return null;
  return arr.length === 1 ? arr[0] : arr; // single object, or array (page shows nav)
}
function cleanCertification(c) {
  if (!c) return null;
  const badge = (c.badge || "").trim();
  const heading = (c.heading || "").trim();
  const image = c.image || null;
  const paragraphs = cleanStrList(c.paragraphs);
  if (!badge && !heading && !image && paragraphs.length === 0) return null;
  return {
    ...(badge ? { badge } : {}),
    ...(heading ? { heading } : {}),
    ...(image ? { image } : {}),
    paragraphs,
  };
}
function cleanLayoutData(ld) {
  const days = (Array.isArray(ld?.days) ? ld.days : [])
    .map((d) => ({
      label: (d.label || "").trim(),
      sessions: (Array.isArray(d.sessions) ? d.sessions : [])
        .map((s) => ({ color: s.color === "dark" ? "dark" : "red", title: (s.title || "").trim(), bullets: cleanStrList(s.bullets) }))
        .filter((s) => s.title || s.bullets.length),
    }))
    .filter((d) => d.label || d.sessions.length);
  return { heading: (ld?.heading || "").trim(), badge: (ld?.badge || "").trim(), days };
}

/* ── Friendly editors that replace the old JSON textareas ──────────────────── */

function SubForm({ title, onRemove, children }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50 space-y-3 relative">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">{title}</p>
        {onRemove && (
          <button type="button" onClick={onRemove} className="p-1 text-slate-400 hover:text-red-600" aria-label="Remove">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function FacilitatorsEditor({ value, onChange }) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  const setItem = (i, patch) => onChange(list.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const add = () => onChange([...list, { name: "", role: "", image: null, bg: null, expertise: [], biography: [] }]);
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-3">
      {list.map((f, i) => (
        <SubForm key={i} title={`Facilitator ${i + 1}`} onRemove={() => remove(i)}>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Name" value={f.name} onChange={(v) => setItem(i, { name: v })} placeholder="e.g. Prof. Dr. Joel Farnworth" />
            <TextField label="Role / title" value={f.role} onChange={(v) => setItem(i, { role: v })} placeholder="e.g. Dean of Business…" />
            <MediaInput label="Photo" value={f.image} onChange={(v) => setItem(i, { image: v })} />
            <MediaInput label="Background image" value={f.bg} onChange={(v) => setItem(i, { bg: v })} />
          </div>
          <StringListEditor label="Area of expertise" value={f.expertise} onChange={(v) => setItem(i, { expertise: v })} placeholder="e.g. Leadership Development" />
          <StringListEditor label="Biography" value={f.biography} onChange={(v) => setItem(i, { biography: v })} placeholder="e.g. Coach and Consultant" />
        </SubForm>
      ))}
      <button type="button" onClick={add} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark">
        <Plus className="w-4 h-4" /> Add facilitator
      </button>
      {list.length > 1 && (
        <p className="text-xs text-slate-400">The public page shows prev/next arrows to switch between facilitators.</p>
      )}
    </div>
  );
}

function CertificationEditor({ value, onChange }) {
  const v = value || {};
  const set = (patch) => onChange({ ...v, ...patch });
  return (
    <div className="space-y-3">
      <TextField label="Badge" value={v.badge} onChange={(x) => set({ badge: x })} placeholder="e.g. Recognition of Learning" />
      <TextArea label="Heading" value={v.heading} onChange={(x) => set({ heading: x })} rows={3} hint="Each new line becomes a separate line in the large heading." />
      <MediaInput label="Certificate image" value={v.image} onChange={(x) => set({ image: x })} kind="image" />
      <StringListEditor label="Paragraphs" value={v.paragraphs} onChange={(x) => set({ paragraphs: x })} placeholder="A paragraph of text" />
    </div>
  );
}

const SESSION_COLORS = [
  { value: "red", label: "Red" },
  { value: "dark", label: "Dark" },
];

function CurriculumEditor({ value, onChange }) {
  const v = value || {};
  const days = Array.isArray(v.days) ? v.days : [];
  const setV = (patch) => onChange({ ...v, ...patch });
  const setDays = (d) => setV({ days: d });
  const setDay = (i, patch) => setDays(days.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const addDay = () => setDays([...days, { label: `DAY ${days.length + 1}`, sessions: [{ color: days.length % 2 === 0 ? "red" : "dark", title: "", bullets: [] }] }]);
  const removeDay = (i) => setDays(days.filter((_, idx) => idx !== i));
  const setSessions = (di, sessions) => setDay(di, { sessions });
  const addSession = (di) => {
    const s = Array.isArray(days[di].sessions) ? days[di].sessions : [];
    setSessions(di, [...s, { color: s.length % 2 === 0 ? "red" : "dark", title: "", bullets: [] }]);
  };
  const setSession = (di, si, patch) => setSessions(di, (days[di].sessions || []).map((x, idx) => (idx === si ? { ...x, ...patch } : x)));
  const removeSession = (di, si) => setSessions(di, (days[di].sessions || []).filter((_, idx) => idx !== si));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Heading" value={v.heading} onChange={(x) => setV({ heading: x })} placeholder="e.g. 5 Days of Leadership & Transformation" />
        <TextField label="Badge" value={v.badge} onChange={(x) => setV({ badge: x })} placeholder="e.g. 5 Days" />
      </div>
      {days.map((day, di) => (
        <SubForm key={di} title={`Day ${di + 1}`} onRemove={() => removeDay(di)}>
          <TextField label="Day label" value={day.label} onChange={(x) => setDay(di, { label: x })} placeholder="e.g. DAY 1" />
          <div className="space-y-2.5">
            {(day.sessions || []).map((s, si) => (
              <div key={si} className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-2 relative">
                <button type="button" onClick={() => removeSession(di, si)} className="absolute top-1.5 right-1.5 p-1 text-slate-300 hover:text-red-600" aria-label="Remove session">
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-[1fr_7rem] gap-2 pr-6">
                  <TextField label={`Session ${si + 1} title`} value={s.title} onChange={(x) => setSession(di, si, { title: x })} placeholder="Session theme" />
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Colour</span>
                    <select value={s.color || "red"} onChange={(e) => setSession(di, si, { color: e.target.value })} className={`${inputCls} mt-1.5 bg-white`}>
                      {SESSION_COLORS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <StringListEditor label="Bullets" value={s.bullets} onChange={(x) => setSession(di, si, { bullets: x })} placeholder="A topic covered" />
              </div>
            ))}
            <button type="button" onClick={() => addSession(di)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark">
              <Plus className="w-3.5 h-3.5" /> Add session
            </button>
          </div>
        </SubForm>
      ))}
      <button type="button" onClick={addDay} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark">
        <Plus className="w-4 h-4" /> Add day
      </button>
    </div>
  );
}

// Fallback for the advanced layout styles (different data shape) — keeps them
// editable/safe as JSON. New programs should use Curriculum / Session plan above.
function LayoutJsonFallback({ value, onChange }) {
  const [text, setText] = useState(() => (value == null ? "" : JSON.stringify(value, null, 2)));
  const [err, setErr] = useState("");
  const handle = (t) => {
    setText(t);
    const trimmed = t.trim();
    if (!trimmed) { setErr(""); onChange(null); return; }
    try { onChange(JSON.parse(trimmed)); setErr(""); } catch (e) { setErr(e.message); } // keep last valid
  };
  return (
    <div>
      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
        This is an <strong>advanced</strong> layout style with a custom shape, so it&apos;s edited as JSON. For simple
        day-by-day content, switch the layout to <strong>Curriculum</strong> or <strong>Session plan</strong> above.
      </p>
      <textarea
        value={text}
        onChange={(e) => handle(e.target.value)}
        rows={10}
        spellCheck={false}
        className={`${inputCls} font-mono text-xs`}
      />
      {err && <p className="text-xs text-red-600 mt-1">Invalid JSON: {err}</p>}
    </div>
  );
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
  const [videoUrl, setVideoUrl] = useState(editing?.videoUrl || "");

  // pricing (price shown in major units, stored as cents)
  const [price, setPrice] = useState(editing?.priceCents != null ? String(editing.priceCents / 100) : "");
  const [currency, setCurrency] = useState(editing?.currency || "SGD");
  const [pricingPeriod, setPricingPeriod] = useState(editing?.pricingPeriod || "");
  const [pricingHeading, setPricingHeading] = useState(editing?.pricingHeading || "");
  const [pricingDescription, setPricingDescription] = useState(editing?.pricingDescription || "");
  const [pricingNote, setPricingNote] = useState(editing?.pricingNote || "");

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
  const [ratingEnabled, setRatingEnabled] = useState(editing?.ratingEnabled ?? true);
  const [sortOrder, setSortOrder] = useState(editing?.sortOrder != null ? String(editing.sortOrder) : "0");
  const [active, setActive] = useState(editing?.isActive ?? true);
  const [published, setPublished] = useState(editing?.isPublished ?? true);
  const [clickable, setClickable] = useState(editing?.isClickable ?? true);
  const [linkUrl, setLinkUrl] = useState(editing?.linkUrl || "");
  const [showAccreditedBy, setShowAccreditedBy] = useState(editing?.showAccreditedBy ?? true);
  const [showRegistration, setShowRegistration] = useState(editing?.showRegistration ?? true);

  // Structured section content (edited via friendly forms, not JSON).
  const [facilitators, setFacilitators] = useState(() => {
    const f = editing?.facilitator;
    return Array.isArray(f) ? f : f ? [f] : [];
  });
  const [certification, setCertification] = useState(editing?.certification || null);
  const [layoutType, setLayoutType] = useState(editing?.layoutType || "");
  const [layoutData, setLayoutData] = useState(editing?.layoutData || null);

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

    // Build the section content from the structured editors.
    const facilitatorValue = cleanFacilitatorList(facilitators);
    const certificationValue = cleanCertification(certification);
    // Simple layouts → clean the day/session/bullet shape; advanced → pass the
    // (JSON-fallback) object through untouched so its custom shape isn't mangled.
    let layoutValue = null;
    if (layoutType) {
      if (SIMPLE_LAYOUTS.has(layoutType)) {
        layoutValue = cleanLayoutData(layoutData);
        if (!layoutValue.heading && layoutValue.days.length === 0) {
          return abort("You selected a curriculum layout — add a heading and at least one day, or set the layout to “None”.");
        }
      } else {
        layoutValue = layoutData || null;
        if (!layoutValue) {
          return abort("This advanced layout needs its JSON content, or set the layout to “None”.");
        }
      }
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
      videoUrl: nn(videoUrl),
      currency: (currency || "SGD").toUpperCase(),
      pricingPeriod: nn(pricingPeriod),
      pricingHeading: nn(pricingHeading),
      pricingDescription: nn(pricingDescription),
      pricingNote: nn(pricingNote),
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
      facilitator: facilitatorValue,
      certification: certificationValue,
      layoutType: layoutType || null,
      layoutData: layoutValue,
      sortOrder: Number(sortOrder) || 0,
      isActive: active,
      isPublished: published,
      ratingEnabled,
      showAccreditedBy,
      showRegistration,
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

      <Section title="Page sections" description="Show or hide fixed sections on the public program page. (Other sections — Overview, Curriculum, Gains, Focus areas, Facilitator, Certification, Pricing, FAQs — hide automatically when left empty.)">
        <div className="grid grid-cols-2 gap-4">
          <Toggle label="Accredited By" value={showAccreditedBy} onChange={setShowAccreditedBy} onText="Shown" offText="Hidden" />
          <Toggle label="Registration form" value={showRegistration} onChange={setShowRegistration} onText="Shown" offText="Hidden" />
        </div>
      </Section>

      <Section title="Hero & media">
        <div className="grid grid-cols-2 gap-4">
          <MediaInput label="Banner" value={banner} onChange={setBanner} />
          <MediaInput label="Card image" value={cardImage} onChange={setCardImage} />
          <MediaInput label="Brochure (PDF)" kind="pdf" value={brochure} onChange={setBrochure} />
        </div>
        <TextField
          label="Programme video URL"
          value={videoUrl}
          onChange={setVideoUrl}
          error={fe.videoUrl}
          placeholder="https://www.youtube.com/watch?v=…  or  /video/clip.mp4"
          hint="Gated on the public Program page — visitors submit the lead form to watch. Leave blank to hide the video."
        />
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
        <TextField
          label="Alternative note (when price isn't finalised)"
          value={pricingNote}
          onChange={setPricingNote}
          placeholder="e.g. Contact us via email for further details."
          hint="Shown in place of the price when the Price field is left blank. Editable independently of the price."
        />
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

      <Section title="Facilitator(s)" description="Add one or more facilitators. With more than one, the public page shows prev/next arrows.">
        <FacilitatorsEditor value={facilitators} onChange={setFacilitators} />
      </Section>

      <Section title="Certification" description="The 'Certification on Successful Completion' block. Leave all fields blank to hide it.">
        <CertificationEditor value={certification} onChange={setCertification} />
      </Section>

      <Section title="Curriculum" description="The day-by-day programme journey. Pick a layout style, then add days, sessions and bullet points.">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Curriculum layout</span>
          <select value={layoutType} onChange={(e) => setLayoutType(e.target.value)} className={`${inputCls} mt-1.5 bg-white`}>
            {LAYOUT_TYPES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          {(fe.layoutType || fe.layoutData) && <p className="text-xs text-red-600 mt-1">{fe.layoutType || fe.layoutData}</p>}
        </label>
        {layoutType &&
          (SIMPLE_LAYOUTS.has(layoutType) ? (
            <CurriculumEditor value={layoutData} onChange={setLayoutData} />
          ) : (
            <LayoutJsonFallback value={layoutData} onChange={setLayoutData} />
          ))}
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
