import { AlertTriangle, BarChart3, Map, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TABS = [
  { id: 'dashboard', label: 'GIS & Live Feed', icon: Map },
  { id: 'citizen', label: 'AI Inspection', icon: Upload },
  { id: 'analytics', label: 'Executive Metrics', icon: BarChart3 },
];

export default function TabNav() {
  const { activeTab, setActiveTab, disasterMode } = useApp();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-ops-border pb-3">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
              active
                ? disasterMode
                  ? 'tab-active border-hazard-crimson text-hazard-amber shadow-hazard'
                  : 'tab-active border-accent-cyan text-accent-cyan shadow-glow'
                : 'border-transparent text-slate-400 hover:border-ops-border hover:text-slate-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
      {disasterMode && (
        <span className="ml-auto inline-flex items-center gap-1 rounded-lg border border-hazard-crimson/50 bg-hazard-crimson/10 px-3 py-2 text-xs font-semibold text-hazard-amber">
          <AlertTriangle className="h-3.5 w-3.5" />
          Emergency UI active
        </span>
      )}
    </nav>
  );
}
