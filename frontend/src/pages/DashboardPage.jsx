import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import ReportsMap from '../components/ReportsMap';
import StatCard from '../components/StatCard';
import { fetchReports, fetchStatistics } from '../services/api';
import { SEVERITY_COLORS } from '../utils/format';
import { EMERGENCY_ROUTES } from '../utils/disasterMock';

const SEVERITIES = ['', 'low', 'high', 'critical'];
const STATUSES = ['', 'pending', 'assigned', 'resolved', 'duplicate'];

export default function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [disasterMode, setDisasterMode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (disasterMode) params.criticalOnly = true;
      else {
        if (severityFilter) params.severity = severityFilter;
        if (statusFilter) params.status = statusFilter;
      }
      const [rep, st] = await Promise.all([fetchReports(params), fetchStatistics()]);
      setReports(rep);
      setStats(st);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }, [severityFilter, statusFilter, disasterMode]);

  useEffect(() => {
    load();
  }, [load]);

  const pieData = useMemo(() => {
    if (!stats?.byDamageType) return [];
    return Object.entries(stats.byDamageType).map(([name, value]) => ({ name, value }));
  }, [stats]);

  const pieColors = ['#0284c7', '#ea580c', '#16a34a', '#7c3aed', '#64748b'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Authority dashboard</h1>
          <p className="mt-1 text-slate-600">Live map, filters, and analytics for road damage reports.</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800">
          <input type="checkbox" checked={disasterMode} onChange={(e) => setDisasterMode(e.target.checked)} className="rounded" />
          Disaster mode (critical only)
        </label>
      </div>

      {loading && !stats && <LoadingSpinner />}
      <ErrorAlert message={error} onRetry={load} />

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total reports" value={stats.totalReports} accent="brand" />
          <StatCard title="Critical reports" value={stats.criticalReports} accent="red" />
          <StatCard title="Resolved" value={stats.resolved} accent="green" />
          <StatCard title="Pending" value={stats.pending} accent="amber" />
        </div>
      )}

      <div className="card">
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="label">Severity</label>
            <select
              className="input w-40"
              value={severityFilter}
              disabled={disasterMode}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input w-40"
              value={statusFilter}
              disabled={disasterMode}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
              <option value="duplicate">Duplicate</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full" style={{ background: SEVERITY_COLORS.critical }} /> Critical
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full" style={{ background: SEVERITY_COLORS.high }} /> High
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full" style={{ background: SEVERITY_COLORS.low }} /> Low
            </span>
          </div>
        </div>

        {disasterMode && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <p className="font-semibold">Emergency overlay active</p>
            <p className="mt-1">Dashed blue lines: {EMERGENCY_ROUTES.map((r) => r.name).join(', ')}. Red zones: affected areas (mock).</p>
          </div>
        )}

        {!loading && <ReportsMap reports={reports} disasterMode={disasterMode} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-semibold">Damage distribution</h2>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No data yet</p>
          )}
        </div>
        <div className="card">
          <h2 className="mb-4 font-semibold">Daily reports (7 days)</h2>
          {stats?.dailyReports?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.dailyReports}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No data yet</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 font-semibold">Recent reports</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Severity</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Confidence</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 10).map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 capitalize">{r.damageType}</td>
                  <td className="py-2 pr-4 capitalize">{r.severity}</td>
                  <td className="py-2 pr-4 capitalize">{r.status}</td>
                  <td className="py-2 pr-4">{(r.confidence * 100).toFixed(0)}%</td>
                  <td className="py-2">
                    <Link to={`/reports/${r.id}`} className="font-medium text-brand-600 hover:underline">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!reports.length && !loading && <p className="py-4 text-slate-500">No reports match filters.</p>}
        </div>
      </div>
    </div>
  );
}
