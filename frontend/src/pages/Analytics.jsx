import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, CheckCircle2, PiggyBank, Radar } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import MetricsCard from '../components/MetricsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchStatistics } from '../services/api';
import { useApp } from '../context/AppContext';

const PIE_COLORS = ['#ef4444', '#f59e0b', '#06b6d4', '#3b82f6', '#10b981'];

export default function AnalyticsPage() {
  const { refreshHeaderStats, setOffline } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchStatistics();
      setStats(res.data);
      setOffline(res.offline);
      refreshHeaderStats(res.data);
      setLoading(false);
    })();
  }, [refreshHeaderStats, setOffline]);

  const damageData = useMemo(
    () => (stats?.byDamageType ? Object.entries(stats.byDamageType).map(([name, value]) => ({ name, value })) : []),
    [stats],
  );

  const pipeline = useMemo(() => {
    if (!stats) return [];
    const assigned = Math.max(0, stats.totalReports - stats.pending - stats.resolved);
    return [
      { stage: 'Pending', count: stats.pending },
      { stage: 'In Progress', count: assigned },
      { stage: 'Resolved', count: stats.resolved },
    ];
  }, [stats]);

  const completionRate = stats?.totalReports
    ? Math.round((stats.resolved / stats.totalReports) * 100)
    : 0;

  if (loading && !stats) return <LoadingSpinner label="Loading executive metrics…" />;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricsCard title="Total inspections" value={stats?.totalReports ?? 0} icon={Radar} />
        <MetricsCard
          title="Est. cost savings"
          value="72%"
          subtitle="vs manual survey baseline (60–80% target)"
          icon={PiggyBank}
          accent="green"
          trend={8}
        />
        <MetricsCard title="Repair completion" value={`${completionRate}%`} icon={CheckCircle2} accent="green" />
        <MetricsCard
          title="High-priority hazards"
          value={(stats?.bySeverity?.critical ?? 0) + (stats?.bySeverity?.high ?? 0)}
          icon={AlertTriangle}
          accent="red"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-4">
          <h3 className="mb-4 text-sm font-semibold text-white">Damage breakdown</h3>
          {damageData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={damageData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {damageData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No distribution data</p>
          )}
        </div>

        <div className="panel p-4">
          <h3 className="mb-4 text-sm font-semibold text-white">Reports by day (7d)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.dailyReports ?? []}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
              <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel p-4">
        <h3 className="mb-4 text-sm font-semibold text-white">Status progression pipeline</h3>
        <div className="space-y-3">
          {pipeline.map((row) => {
            const pct = stats?.totalReports ? Math.round((row.count / stats.totalReports) * 100) : 0;
            return (
              <div key={row.stage}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-400">{row.stage}</span>
                  <span className="font-mono text-slate-300">
                    {row.count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ops-bg">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-blue" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
