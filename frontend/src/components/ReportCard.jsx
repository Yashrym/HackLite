import { MapPin, ScanEye } from 'lucide-react';
import { API_TO_STATUS, STATUS_OPTIONS, mediaUrl, updateReportStatus } from '../services/api';
import { useApp } from '../context/AppContext';
import SeverityBadge from './SeverityBadge';
import { formatTimestamp, pct } from '../utils/format';
import { useState } from 'react';

export default function ReportCard({ report, onUpdated, onHighlight }) {
  const { setHighlightReportId } = useApp();
  const [status, setStatus] = useState(API_TO_STATUS[report.status] || 'Pending');
  const [saving, setSaving] = useState(false);

  const thumb = mediaUrl(report.imageUrl);
  const hasImage = Boolean(report.imageUrl);

  const onStatusChange = async (e) => {
    const next = e.target.value;
    setStatus(next);
    setSaving(true);
    try {
      const { data } = await updateReportStatus(report.id, next);
      onUpdated?.(data);
    } catch {
      setStatus(API_TO_STATUS[report.status] || 'Pending');
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="panel overflow-hidden transition hover:border-accent-cyan/30">
      <div className="flex gap-3 p-3">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-ops-border bg-ops-bg">
          {hasImage ? (
            <img src={thumb} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-[10px] text-slate-500">
              <ScanEye className="h-5 w-5 text-accent-cyan/60" />
              YOLO preview
            </div>
          )}
          <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[10px] font-mono text-accent-cyan">
            {pct(report.confidence)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold capitalize text-white">{report.damageType}</h3>
            <SeverityBadge severity={report.severity} />
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{report.description || 'No description'}</p>
          <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-slate-500">
            <MapPin className="h-3 w-3" />
            {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}
          </p>
          <p className="text-[10px] text-slate-600">{formatTimestamp(report.timestamp)}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-ops-border bg-ops-bg/50 px-3 py-2">
        <select
          className="input-dark max-w-[140px] py-1.5 text-xs"
          value={status}
          disabled={saving}
          onChange={onStatusChange}
          aria-label="Report status"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-ghost ml-auto py-1.5 text-xs"
          onClick={() => {
            setHighlightReportId(report.id);
            onHighlight?.(report);
          }}
        >
          Highlight on map
        </button>
      </div>
    </article>
  );
}
