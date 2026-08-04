import { SEVERITY_STYLES } from '../utils/format';

export default function SeverityBadge({ severity }) {
  const key = (severity || 'low').toLowerCase();
  const cls = SEVERITY_STYLES[key] || SEVERITY_STYLES.low;
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}>
      {key}
    </span>
  );
}
