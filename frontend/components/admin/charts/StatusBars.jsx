"use client";

/**
 * Horizontal bar list (e.g. registrations by status). Pure HTML/CSS — responsive.
 * @param {Array<{label,value,color}>} items
 */
export default function StatusBars({ items = [] }) {
  const max = Math.max(1, ...items.map((i) => i.value || 0));

  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No data yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li key={i}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-slate-600">{it.label}</span>
            <span className="font-bold text-slate-700">{it.value}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(it.value / max) * 100}%`, background: it.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
