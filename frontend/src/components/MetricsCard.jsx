export default function MetricsCard({ title, value, subtitle, icon: Icon, trend, accent = 'cyan' }) {
  const ring =
    accent === 'red'
      ? 'from-hazard-crimson/20 to-transparent'
      : accent === 'green'
        ? 'from-safe/20 to-transparent'
        : accent === 'amber'
          ? 'from-hazard-amber/20 to-transparent'
          : 'from-accent-cyan/20 to-transparent';

  return (
    <div className={`panel relative overflow-hidden p-4`}>
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${ring}`} />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          {trend != null && (
            <p className={`mt-1 text-xs font-medium ${trend >= 0 ? 'text-safe' : 'text-hazard-crimson'}`}>
              {trend >= 0 ? '+' : ''}
              {trend}% vs baseline
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg border border-ops-border bg-ops-bg p-2 text-accent-cyan">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
