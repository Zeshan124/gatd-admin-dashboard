"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Mail,
  FileDown,
  Wallet,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { statsApi, registrationsApi } from "@/lib/adminApi";
import { formatMoney, formatDate } from "@/lib/format";
import StatCard from "@/components/admin/StatCard";
import StatusBadge, { REGISTRATION_STATUSES } from "@/components/admin/StatusBadge";
import TrendChart from "@/components/admin/charts/TrendChart";
import DonutChart from "@/components/admin/charts/DonutChart";
import StatusBars from "@/components/admin/charts/StatusBars";

// Channel palette — validated (CVD-safe) against the admin surface.
const CH = { registrations: "#c10007", messages: "#2563eb", brochures: "#0d9488" };

// Registration status hues (match the StatusBadge vocabulary).
const REG_STATUS_HEX = {
  new: "#2563eb",
  contacted: "#4f46e5",
  in_review: "#d97706",
  confirmed: "#0d9488",
  invoiced: "#7c3aed",
  paid: "#16a34a",
  enrolled: "#059669",
  cancelled: "#64748b",
  rejected: "#dc2626",
  spam: "#94a3b8",
};

const TREND_LINES = [
  { key: "registrations", label: "Registrations", color: CH.registrations },
  { key: "messages", label: "Messages", color: CH.messages },
  { key: "brochures", label: "Brochure Leads", color: CH.brochures },
];

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, listRes] = await Promise.all([
        statsApi.overview(),
        registrationsApi.list({ page: 1, pageSize: 6, sort: "-created_at" }),
      ]);
      setStats(statsRes?.data || null);
      setRecent(listRes.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = stats?.totals || {};
  const reg = stats?.registrations || {};
  const msg = stats?.messages || {};
  const broch = stats?.brochureLeads || {};
  const series = stats?.series || [];

  const donutData = [
    { label: "Registrations", value: totals.registrations || 0, color: CH.registrations },
    { label: "Messages", value: totals.messages || 0, color: CH.messages },
    { label: "Brochure Leads", value: totals.brochureLeads || 0, color: CH.brochures },
  ];

  const statusItems = REGISTRATION_STATUSES.filter((s) => reg.byStatus?.[s.value]).map((s) => ({
    label: s.label,
    value: reg.byStatus[s.value],
    color: REG_STATUS_HEX[s.value] || "#94a3b8",
  }));

  const dash = (v) => (loading ? "…" : v ?? "—");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Registrations, enquiries and brochure leads at a glance.</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Couldn&apos;t load dashboard data</p>
            <p className="text-amber-700">{error}</p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total registrations"
          value={dash(totals.registrations)}
          icon={ClipboardList}
          accent="bg-brand-50 text-brand"
          hint={!loading && reg.thisMonth != null ? `+${reg.thisMonth} this month` : undefined}
        />
        <StatCard
          label="Total messages"
          value={dash(totals.messages)}
          icon={Mail}
          accent="bg-blue-50 text-blue-600"
          hint={!loading && msg.unread != null ? `${msg.unread} unread` : undefined}
        />
        <StatCard
          label="Total brochure leads"
          value={dash(totals.brochureLeads)}
          icon={FileDown}
          accent="bg-teal-50 text-teal-600"
          hint={!loading && broch.fresh != null ? `${broch.fresh} new` : undefined}
        />
        <StatCard
          label="Pipeline value"
          value={loading ? "…" : reg.bookedRevenueCents != null ? formatMoney(reg.bookedRevenueCents) : "—"}
          icon={Wallet}
          accent="bg-amber-50 text-amber-600"
          hint={!loading && reg.realizedRevenueCents != null ? `${formatMoney(reg.realizedRevenueCents)} realized` : undefined}
        />
      </div>

      {/* Trend + channel mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="text-sm font-bold text-slate-700 inline-flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              Submissions · last 14 days
            </h3>
            <div className="flex items-center gap-3">
              {TREND_LINES.map((l) => (
                <span key={l.key} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="h-60 flex items-center justify-center text-sm text-slate-400">Loading…</div>
          ) : (
            <TrendChart series={series} lines={TREND_LINES} />
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Leads by channel</h3>
          {loading ? (
            <div className="h-[168px] flex items-center justify-center text-sm text-slate-400">Loading…</div>
          ) : (
            <DonutChart data={donutData} />
          )}
        </div>
      </div>

      {/* Status breakdown + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Registrations by status</h3>
          {loading ? (
            <div className="text-sm text-slate-400">Loading…</div>
          ) : (
            <StatusBars items={statusItems} />
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">Recent registrations</h3>
            <Link
              href="/admin/registrations"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Loading…</div>
          ) : recent.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No registrations yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="px-5 py-3 font-semibold">Reference</th>
                    <th className="px-5 py-3 font-semibold">Applicant</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recent.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">{r.referenceNo}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800">
                          {r.firstName} {r.lastName || ""}
                        </p>
                        <p className="text-xs text-slate-400">{r.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-700 whitespace-nowrap">
                        {formatMoney(r.totalAmountCents, r.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
