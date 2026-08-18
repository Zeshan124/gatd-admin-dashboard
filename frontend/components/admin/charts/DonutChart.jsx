"use client";

import { useState } from "react";

/**
 * Donut chart with center total, hover-highlight and an HTML legend.
 * @param {Array<{label,value,color}>} data
 */
export default function DonutChart({ data = [], size = 168, thickness = 22 }) {
  const [active, setActive] = useState(null);
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const GAP = total > 0 ? 2 : 0; // small surface gap between segments

  let offset = 0;
  const segs = data.map((d, i) => {
    const frac = total > 0 ? (d.value || 0) / total : 0;
    const len = frac * circ;
    const seg = { ...d, i, dash: Math.max(0, len - GAP), gap: circ - Math.max(0, len - GAP), off: offset };
    offset -= len;
    return seg;
  });

  const centerVal = active != null ? data[active].value : total;
  const centerLabel = active != null ? data[active].label : "Total";

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={c} cy={c} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
          {total > 0 &&
            segs.map((s) => (
              <circle
                key={s.i}
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={active == null || active === s.i ? thickness : thickness - 5}
                strokeDasharray={`${s.dash} ${s.gap}`}
                strokeDashoffset={s.off}
                onMouseEnter={() => setActive(s.i)}
                onMouseLeave={() => setActive(null)}
                style={{ transition: "stroke-width .15s", cursor: "pointer" }}
              />
            ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-800 leading-none">{centerVal}</span>
          <span className="text-[11px] text-slate-400 mt-1">{centerLabel}</span>
        </div>
      </div>

      <ul className="space-y-2.5 min-w-0 flex-1">
        {data.map((d, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm cursor-default"
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-slate-600 truncate">{d.label}</span>
            <span className="ml-auto font-bold text-slate-700">{d.value}</span>
            <span className="text-slate-400 text-xs w-9 text-right">
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
