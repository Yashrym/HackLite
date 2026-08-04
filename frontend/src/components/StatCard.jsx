export default function StatCard({ title, value, subtitle, accent = 'brand' }) {
  const accents = {
    brand: 'border-l-brand-600',
    red: 'border-l-red-600',
    green: 'border-l-green-600',
    amber: 'border-l-amber-500',
  };
  return (
    <div className={`card border-l-4 ${accents[accent] || accents.brand}`}>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}
