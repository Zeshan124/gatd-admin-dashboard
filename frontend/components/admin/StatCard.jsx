export default function StatCard({ label, value, icon: Icon, hint, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
      {Icon && (
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            accent || "bg-brand-50 text-brand"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm text-slate-500 truncate">{label}</p>
        <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{value}</p>
        {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      </div>
    </div>
  );
}
