"use client";

import { useState } from "react";
import { useWidth } from "./useWidth";
import { formatDate } from "@/lib/format";

const shortDate = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/**
 * Multi-series area + line chart with a hover crosshair + tooltip.
 * @param {Array<object>} series  e.g. [{ date, registrations, messages, brochures }]
 * @param {Array<{key,label,color}>} lines
 */
export default function TrendChart({ series = [], lines = [], height = 240 }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);

  const pad = { top: 16, right: 18, bottom: 26, left: 30 };
  const n = series.length;
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const maxVal = Math.max(1, ...series.flatMap((d) => lines.map((l) => d[l.key] || 0)));

  const x = (i) => pad.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v) => pad.top + innerH - (v / maxVal) * innerH;

  const linePath = (key) => series.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d[key] || 0)}`).join(" ");
  const areaPath = (key) => `${linePath(key)} L${x(n - 1)},${pad.top + innerH} L${x(0)},${pad.top + innerH} Z`;

  const ticks = 4;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => Math.round((maxVal / ticks) * i));
  const xLabelIdx = n > 1 ? [0, Math.floor((n - 1) / 2), n - 1] : [0];

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rx = e.clientX - rect.left - pad.left;
    const i = Math.round((rx / innerW) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && n > 0 && (
        <svg width={width} height={height} className="block overflow-visible">
          {/* gridlines + y labels */}
          {tickVals.map((tv, i) => (
            <g key={i}>
              <line x1={pad.left} x2={width - pad.right} y1={y(tv)} y2={y(tv)} stroke="#eef2f6" strokeWidth="1" />
              <text x={pad.left - 6} y={y(tv) + 3} textAnchor="end" fontSize="10" fill="#94a3b8">
                {tv}
              </text>
            </g>
          ))}
          {/* x labels */}
          {xLabelIdx.map((i) => (
            <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">
              {shortDate(series[i]?.date)}
            </text>
          ))}
          {/* areas + lines */}
          {lines.map((l) => (
            <g key={l.key}>
              <path d={areaPath(l.key)} fill={l.color} opacity="0.08" />
              <path d={linePath(l.key)} fill="none" stroke={l.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            </g>
          ))}
          {/* hover crosshair + dots */}
          {hover != null && series[hover] && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
              {lines.map((l) => (
                <circle key={l.key} cx={x(hover)} cy={y(series[hover][l.key] || 0)} r="4" fill="#fff" stroke={l.color} strokeWidth="2" />
              ))}
            </g>
          )}
          {/* hover capture */}
          <rect
            x={pad.left}
            y={pad.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          />
        </svg>
      )}

      {/* tooltip */}
      {hover != null && series[hover] && width > 0 && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-slate-100 px-3 py-2 text-xs whitespace-nowrap"
          style={{ left: `${(x(hover) / width) * 100}%`, top: 0 }}
        >
          <p className="font-semibold text-slate-700 mb-1">{formatDate(series[hover].date)}</p>
          {lines.map((l) => (
            <div key={l.key} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-slate-500">{l.label}</span>
              <span className="ml-auto font-bold text-slate-700 pl-3">{series[hover][l.key] || 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
