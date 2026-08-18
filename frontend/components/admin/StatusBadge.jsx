/**
 * Registration status vocabulary + badge.
 * Mirrors the status enum + state machine in
 * docs/program-registrations-backend.md (§9).
 */
export const REGISTRATION_STATUSES = [
  { value: "new", label: "New", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  { value: "contacted", label: "Contacted", cls: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
  { value: "in_review", label: "In Review", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  { value: "confirmed", label: "Confirmed", cls: "bg-teal-50 text-teal-700 ring-teal-200" },
  { value: "invoiced", label: "Invoiced", cls: "bg-purple-50 text-purple-700 ring-purple-200" },
  { value: "paid", label: "Paid", cls: "bg-green-50 text-green-700 ring-green-200" },
  { value: "enrolled", label: "Enrolled", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: "cancelled", label: "Cancelled", cls: "bg-slate-100 text-slate-600 ring-slate-200" },
  { value: "rejected", label: "Rejected", cls: "bg-red-50 text-red-700 ring-red-200" },
  { value: "spam", label: "Spam", cls: "bg-slate-100 text-slate-500 ring-slate-200" },
];

/** Contact-message status vocabulary. */
export const MESSAGE_STATUSES = [
  { value: "new", label: "New", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  { value: "read", label: "Read", cls: "bg-slate-100 text-slate-600 ring-slate-200" },
  { value: "replied", label: "Replied", cls: "bg-green-50 text-green-700 ring-green-200" },
  { value: "archived", label: "Archived", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
];

/** Brochure-lead status vocabulary. */
export const BROCHURE_STATUSES = [
  { value: "new", label: "New", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  { value: "contacted", label: "Contacted", cls: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
  { value: "archived", label: "Archived", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
];

export function statusLabel(value) {
  return REGISTRATION_STATUSES.find((s) => s.value === value)?.label || value || "—";
}

export default function StatusBadge({ status, statuses = REGISTRATION_STATUSES }) {
  const s =
    statuses.find((x) => x.value === status) || {
      label: status || "—",
      cls: "bg-slate-100 text-slate-600 ring-slate-200",
    };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset whitespace-nowrap ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
