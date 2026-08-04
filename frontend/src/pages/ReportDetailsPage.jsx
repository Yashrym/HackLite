import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DetectionCanvas from '../components/DetectionCanvas';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchReport, updateReportStatus } from '../services/api';
import { formatTimestamp, severityLabel, statusLabel } from '../utils/format';

export default function ReportDetailsPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReport(id);
      setReport(data);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (status) => {
    setActionLoading(true);
    try {
      const updated = await updateReportStatus(id, status);
      setReport(updated);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading report…" />;
  if (!report) return <ErrorAlert message={error || 'Report not found'} onRetry={load} />;

  const dets = report.detections || [];
  let imgW;
  let imgH;
  if (dets.length) {
    imgW = Math.max(...dets.flatMap((d) => [d.bbox?.[2] ?? 0, d.bbox?.[0] ?? 0]));
    imgH = Math.max(...dets.flatMap((d) => [d.bbox?.[3] ?? 0, d.bbox?.[1] ?? 0]));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="text-3xl font-bold capitalize">{report.damageType} report</h1>
      <ErrorAlert message={error} />

      <div className="card space-y-4">
        <DetectionCanvas
          imageSrc={report.imageUrl}
          detections={dets}
          width={imgW}
          height={imgH}
        />

        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-slate-500">Damage type</dt>
            <dd className="font-medium capitalize">{report.damageType}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Confidence</dt>
            <dd className="font-medium">{(report.confidence * 100).toFixed(1)}%</dd>
          </div>
          <div>
            <dt className="text-slate-500">Severity</dt>
            <dd className="font-medium">{severityLabel(report.severity)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="font-medium">{statusLabel(report.status)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">GPS</dt>
            <dd className="font-medium">
              {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Timestamp</dt>
            <dd className="font-medium">{formatTimestamp(report.timestamp)}</dd>
          </div>
        </dl>

        {report.description && (
          <div>
            <p className="text-sm text-slate-500">Description</p>
            <p className="mt-1 text-sm">{report.description}</p>
          </div>
        )}

        {report.detections?.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Detection labels</p>
            <ul className="rounded-lg border border-slate-200 divide-y text-sm">
              {report.detections.map((d, i) => (
                <li key={i} className="flex justify-between px-3 py-2 capitalize">
                  <span>{d.damage_type ?? d.damageType}</span>
                  <span>{((d.confidence ?? 0) * 100).toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button type="button" className="btn-secondary" disabled={actionLoading} onClick={() => setStatus('assigned')}>
            Assign crew
          </button>
          <button type="button" className="btn-primary" disabled={actionLoading} onClick={() => setStatus('resolved')}>
            Mark resolved
          </button>
          <button type="button" className="btn-secondary" disabled={actionLoading} onClick={() => setStatus('duplicate')}>
            Mark duplicate
          </button>
          <button type="button" className="btn-secondary" disabled={actionLoading} onClick={() => setStatus('pending')}>
            Reopen (pending)
          </button>
        </div>
      </div>
    </div>
  );
}
