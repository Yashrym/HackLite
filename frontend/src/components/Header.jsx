import CodePulseBadge from './CodePulseBadge';
import { useApp } from '../context/AppContext';
import { AlertOctagon, Radio, ShieldAlert } from 'lucide-react';

function StatPill({ label, value, tone = 'cyan' }) {
  const tones = {
    cyan: 'border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan',
    red: 'border-hazard-crimson/40 bg-hazard-crimson/10 text-hazard-crimson',
    amber: 'border-hazard-amber/40 bg-hazard-amber/10 text-hazard-amber',
  };
  return (
    <div className={`hidden rounded-full border px-3 py-1.5 text-xs font-medium sm:block ${tones[tone]}`}>
      <span className="text-slate-400">{label}</span>{' '}
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  );
}

export default function Header() {
  const { disasterMode, setDisasterMode, headerStats, offline } = useApp();

  return (
    <header className="panel mb-4 flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black ${
            disasterMode
              ? 'bg-gradient-to-br from-hazard-crimson to-hazard-amber text-white shadow-hazard'
              : 'bg-gradient-to-br from-accent-cyan to-accent-blue text-slate-950 shadow-glow'
          }`}
        >
          VR
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">VisionRoute</h1>
            <CodePulseBadge />
          </div>
          <p className="text-xs text-slate-400">Smart City Road Infrastructure & Disaster Response</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatPill label="Reports" value={headerStats.total} />
        <StatPill label="Critical" value={headerStats.critical} tone="red" />
        <StatPill label="Active alerts" value={headerStats.activeAlerts} tone="amber" />
        {offline && (
          <span className="rounded-full border border-hazard-amber/50 bg-hazard-amber/10 px-2 py-1 text-[10px] font-semibold uppercase text-hazard-amber">
            Mock data
          </span>
        )}
      </div>

      <label
        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-xs transition ${
          disasterMode
            ? 'border-hazard-crimson bg-hazard-crimson/15 shadow-hazard'
            : 'border-ops-border bg-ops-bg hover:border-slate-600'
        }`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={disasterMode}
          onChange={(e) => setDisasterMode(e.target.checked)}
        />
        <span
          className={`relative h-6 w-11 rounded-full transition ${disasterMode ? 'bg-hazard-crimson' : 'bg-slate-700'}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
              disasterMode ? 'left-5' : 'left-0.5'
            }`}
          />
        </span>
        <span className="max-w-[220px] leading-snug text-slate-200">
          <span className="flex items-center gap-1 font-semibold text-white">
            {disasterMode ? <ShieldAlert className="h-3.5 w-3.5 text-hazard-amber" /> : <Radio className="h-3.5 w-3.5 text-accent-cyan" />}
            Disaster Response Mode
          </span>
          <span className="text-slate-400">Cyclone Ditwa Emergency Active</span>
        </span>
        {disasterMode && <AlertOctagon className="h-4 w-4 shrink-0 text-hazard-amber" />}
      </label>
    </header>
  );
}
