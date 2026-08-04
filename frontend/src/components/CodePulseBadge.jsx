import { Activity } from 'lucide-react';

export default function CodePulseBadge() {
  return (
    <span className="relative inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent-cyan">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent-cyan opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-cyan" />
      </span>
      CodePulse
      <Activity className="h-3 w-3 opacity-80" aria-hidden />
    </span>
  );
}
