import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [disasterMode, setDisasterMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightReportId, setHighlightReportId] = useState(null);
  const [mapHeatmap, setMapHeatmap] = useState(false);
  const [mapCluster, setMapCluster] = useState(true);
  const [offline, setOffline] = useState(false);
  const [headerStats, setHeaderStats] = useState({
    total: 0,
    critical: 0,
    activeAlerts: 0,
  });

  const refreshHeaderStats = useCallback((stats, reports) => {
    if (stats) {
      const active = (stats.pending ?? 0) + Math.max(0, (stats.totalReports ?? 0) - (stats.resolved ?? 0) - (stats.pending ?? 0));
      setHeaderStats({
        total: stats.totalReports ?? 0,
        critical: stats.criticalReports ?? 0,
        activeAlerts: active || stats.pending || 0,
      });
    } else if (reports?.length) {
      setHeaderStats({
        total: reports.length,
        critical: reports.filter((r) => r.severity === 'critical').length,
        activeAlerts: reports.filter((r) => r.status === 'pending' || r.status === 'assigned').length,
      });
    }
  }, []);

  const value = useMemo(
    () => ({
      disasterMode,
      setDisasterMode,
      activeTab,
      setActiveTab,
      severityFilter,
      setSeverityFilter,
      statusFilter,
      setStatusFilter,
      searchQuery,
      setSearchQuery,
      highlightReportId,
      setHighlightReportId,
      mapHeatmap,
      setMapHeatmap,
      mapCluster,
      setMapCluster,
      offline,
      setOffline,
      headerStats,
      refreshHeaderStats,
    }),
    [
      disasterMode,
      activeTab,
      severityFilter,
      statusFilter,
      searchQuery,
      highlightReportId,
      mapHeatmap,
      mapCluster,
      offline,
      headerStats,
      refreshHeaderStats,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
