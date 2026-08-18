export default function ComingSoon({ title, description, icon: Icon }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">{title}</h2>
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center text-center">
        {Icon && (
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand flex items-center justify-center mb-4">
            <Icon className="w-7 h-7" />
          </div>
        )}
        <h3 className="text-lg font-bold text-slate-700">Coming soon</h3>
        <p className="text-sm text-slate-400 max-w-sm mt-1">
          This module will be wired up once its API is available. The
          Registrations module is fully functional today.
        </p>
      </div>
    </div>
  );
}
