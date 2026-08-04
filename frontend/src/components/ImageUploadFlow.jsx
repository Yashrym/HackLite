import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import DetectionCanvas from '../components/DetectionCanvas';
import { useGeolocation } from '../hooks/useGeolocation';
import { useYoloDetection } from '../hooks/useYoloDetection';
import { createReport } from '../services/api';

function LocationFields({ manualLat, setManualLat, manualLng, setManualLng, geoError, onRefresh, geoLoading }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label" htmlFor="lat">
          Latitude {geoLoading && '(detecting…)'}
        </label>
        <input id="lat" className="input" value={manualLat} onChange={(e) => setManualLat(e.target.value)} placeholder="Auto from GPS" />
      </div>
      <div>
        <label className="label" htmlFor="lng">
          Longitude
        </label>
        <input id="lng" className="input" value={manualLng} onChange={(e) => setManualLng(e.target.value)} placeholder="Auto from GPS" />
      </div>
      {geoError && (
        <p className="sm:col-span-2 text-sm text-amber-700">
          GPS unavailable: {geoError}. Enter coordinates manually.
        </p>
      )}
      <button type="button" className="btn-secondary sm:col-span-2 w-fit" onClick={onRefresh}>
        Refresh GPS
      </button>
    </div>
  );
}

export default function ImageUploadFlow({ title, subtitle, showDescription = false }) {
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const { latitude, longitude, hasLocation, error: geoError, loading: geoLoading, refresh } = useGeolocation(manualLat, manualLng);
  const { loading, error, result, previewUrl, runDetection, reset } = useYoloDetection();

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (file) await runDetection(file);
  };

  const onSubmit = async () => {
    if (!result) return;
    if (!hasLocation) {
      setSubmitError('Location is required. Enable GPS or enter latitude/longitude.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const primary = result.detections?.[0];
      const report = await createReport({
        latitude,
        longitude,
        damageType: result.primaryDamageType || primary?.damage_type || 'crack',
        confidence: result.primaryConfidence ?? primary?.confidence ?? 0.5,
        severity: result.suggestedSeverity || 'low',
        imageUrl: result.imageUrl,
        description: showDescription ? description : undefined,
        detections: result.detections,
      });
      setSuccessId(report.id);
      reset();
      setDescription('');
    } catch (e) {
      setSubmitError(e.response?.data?.detail || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">{subtitle}</p>

      <div className="card mt-8 space-y-6">
        <div>
          <label className="label">Road image</label>
          <input type="file" accept="image/*" capture="environment" className="input" onChange={onFile} />
        </div>

        {loading && <LoadingSpinner label="Running YOLOv8 inference…" />}
        <ErrorAlert message={error} />

        {result && previewUrl && (
          <>
            <DetectionCanvas
              imageSrc={previewUrl}
              detections={result.detections}
              width={result.width}
              height={result.height}
            />
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
              {result.detections?.length ? (
                result.detections.map((d, i) => (
                  <li key={i} className="flex justify-between px-4 py-2 capitalize">
                    <span>{d.damage_type}</span>
                    <span className="font-medium">{(d.confidence * 100).toFixed(1)}%</span>
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-slate-500">No damage detected</li>
              )}
            </ul>
          </>
        )}

        <LocationFields
          manualLat={manualLat}
          setManualLat={setManualLat}
          manualLng={manualLng}
          setManualLng={setManualLng}
          geoError={geoError}
          onRefresh={refresh}
          geoLoading={geoLoading}
        />

        {showDescription && (
          <div>
            <label className="label" htmlFor="desc">
              Description (optional)
            </label>
            <textarea id="desc" className="input min-h-[88px]" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        )}

        <ErrorAlert message={submitError} />

        {successId && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Report submitted.{' '}
            <Link to={`/reports/${successId}`} className="font-semibold underline">
              View report
            </Link>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary" disabled={!result || submitting} onClick={onSubmit}>
            {submitting ? 'Submitting…' : 'Submit to VisionRoute'}
          </button>
          {result && (
            <button type="button" className="btn-secondary" onClick={reset}>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
