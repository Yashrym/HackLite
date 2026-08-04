import { Layers, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchReports, fetchStatistics, STATUS_TO_API } from '../services/api';
import { useApp } from '../context/AppContext';
import ReportCard from '../components/ReportCard';
import SmartCityMap from '../components/SmartCityMap';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

export default function DashboardPage() {
  const {
    disasterMode,
    severityFilter,
    setSeverityFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    mapHeatmap,
    setMapHeatmap,
    mapCluster,
    setMapCluster,
    setOffline,
    refreshHeaderStats,
  } = useApp();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (disasterMode) {
        params.criticalOnly = true;
      } else {
        if (severityFilter) params.severity = severityFilter;
        if (statusFilter) params.status = STATUS_TO_API[statusFilter] || statusFilter.toLowerCase().replace(' ', '_');
      }
      const [repRes, statRes] = await Promise.all([fetchReports(params), fetchStatistics()]);
      setReports(repRes.data);
      setOffline(repRes.offline || statRes.offline);
      refreshHeaderStats(statRes.data, repRes.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [disasterMode, severityFilter, statusFilter, setOffline, refreshHeaderStats]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter(
      (r) =>
        r.damageType?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q),
    );
  }, [reports, searchQuery]);

  const onReportUpdated = (updated) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated, status: updated.status } : r)));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="panel flex flex-col gap-3 p-3 lg:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white">Colombo GIS — Live damage layer</h2>
          <div className="flex flex-wrap gap-2">
            <label className="btn-ghost cursor-pointer py-1 text-xs">
              <input type="checkbox" className="mr-1" checked={mapHeatmap} onChange={(e) => setMapHeatmap(e.target.checked)} />
              Heatmap
            </label>
            <label className="btn-ghost cursor-pointer py-1 text-xs">
              <input type="checkbox" className="mr-1" checked={mapCluster} onChange={(e) => setMapCluster(e.target.checked)} />
              Clusters
            </label>
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
              <Layers className="h-3 w-3" /> OSM dark basemap
            </span>
          </div>
        </div>
        {loading && !reports.length ? (
          <LoadingSpinner label="Loading geospatial feed…" />
        ) : (
          <SmartCityMap reports={filtered} className="min-h-[420px] flex-1 lg:h-[calc(100vh-280px)]" />
        )}
      </div>

      <div className="panel flex flex-col lg:col-span-2 lg:max-h-[calc(100vh-200px)]">
        <div className="border-b border-ops-border p-3">
          <h2 className="text-sm font-semibold text-white">Live reports stream</h2>
          <div className="mt-3 space-y-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                className="input-dark pl-9"
                placeholder="Search damage, ID, notes…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                className="input-dark text-xs"
                value={severityFilter}
                disabled={disasterMode}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="">All severity</option>
                <option value="low">Low</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select
                className="input-dark text-xs"
                value={statusFilter}
                disabled={disasterMode}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Duplicate">Duplicate</option>
              </select>
            </div>
          </div>
        </div>
        <ErrorAlert message={error} onRetry={load} />
        <div className="scroll-thin flex-1 space-y-2 overflow-y-auto p-3">
          {filtered.map((r) => (
            <ReportCard key={r.id} report={r} onUpdated={onReportUpdated} />
          ))}
          {!loading && !filtered.length && (
            <p className="py-8 text-center text-sm text-slate-500">No reports match filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
