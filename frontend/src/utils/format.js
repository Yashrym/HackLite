export function formatTimestamp(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export const SEVERITY_STYLES = {
  critical: 'bg-hazard-crimson/20 text-hazard-crimson border-hazard-crimson/40',
  high: 'bg-hazard-amber/20 text-hazard-amber border-hazard-amber/40',
  low: 'bg-safe/15 text-safe border-safe/40',
};

export const DAMAGE_MARKER = {
  pothole: '#ef4444',
  crack: '#f59e0b',
  blocked: '#dc2626',
  infrastructure: '#3b82f6',
  default: '#06b6d4',
};

export function damageColor(type) {
  const key = (type || '').toLowerCase();
  if (key.includes('pothole')) return DAMAGE_MARKER.pothole;
  if (key.includes('crack')) return DAMAGE_MARKER.crack;
  if (key.includes('block')) return DAMAGE_MARKER.blocked;
  if (key.includes('infra')) return DAMAGE_MARKER.infrastructure;
  return DAMAGE_MARKER.default;
}

export function pct(confidence) {
  return `${Math.round((confidence ?? 0) * 100)}%`;
}
