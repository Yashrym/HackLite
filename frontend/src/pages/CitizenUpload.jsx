import { Crosshair, Loader2, MapPin, UploadCloud } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { MAP_CENTER, MAP_ZOOM } from '../data/mockData';
import DetectionPreview from '../components/DetectionPreview';
import ErrorAlert from '../components/ErrorAlert';
import SeverityBadge from '../components/SeverityBadge';
import { detectImage, submitReportMultipart } from '../services/api';

function MapPicker({ position, onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function CitizenUploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [detectPreview, setDetectPreview] = useState(null);
  const inputRef = useRef(null);

  const pickFile = (f) => {
    if (!f) return;
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setDetectPreview(null);
  };

  const grabGps = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation not supported — click the map to set coordinates.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLat(p.coords.latitude);
        setLng(p.coords.longitude);
      },
      (e) => setError(e.message),
      { enableHighAccuracy: true },
    );
  };

  const onSubmit = async () => {
    if (!file || lat == null || lng == null) {
      setError('Image and GPS location are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      let detectionMeta = detectPreview;
      if (!detectionMeta) {
        try {
          detectionMeta = await detectImage(file);
          setDetectPreview(detectionMeta);
        } catch {
          detectionMeta = null;
        }
      }
      const report = await submitReportMultipart({
        file,
        latitude: lat,
        longitude: lng,
        description,
      });
      setResult({
        report,
        detectionMeta,
      });
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onMapPick = useCallback((latitude, longitude) => {
    setLat(latitude);
    setLng(longitude);
  }, []);

  const position = lat != null && lng != null ? [lat, lng] : null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="panel p-4">
          <h2 className="text-lg font-semibold text-white">Citizen AI Inspection Portal</h2>
          <p className="mt-1 text-sm text-slate-400">
            Drag & drop a road photo, confirm location, and submit — YOLO runs on the server via{' '}
            <code className="text-accent-cyan">POST /reports</code>.
          </p>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition ${
              dragOver ? 'border-accent-cyan bg-accent-cyan/5' : 'border-ops-border hover:border-accent-cyan/50'
            }`}
          >
            <UploadCloud className="mb-2 h-10 w-10 text-accent-cyan" />
            <p className="text-sm font-medium text-slate-200">Drop image or tap to upload</p>
            <p className="text-xs text-slate-500">JPEG / PNG — dashcam or mobile</p>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
          </div>

          {preview && (
            <img src={preview} alt="Preview" className="mt-4 max-h-48 w-full rounded-lg border border-ops-border object-contain" />
          )}

          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-slate-400">Description (optional)</label>
            <textarea
              className="input-dark min-h-[72px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lane blocked, depth estimate, landmarks…"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn-ghost" onClick={grabGps}>
              <Crosshair className="h-4 w-4" />
              Auto GPS
            </button>
            <button type="button" className="btn-accent" disabled={!file || submitting} onClick={onSubmit}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit report & run AI detection
            </button>
          </div>
          <ErrorAlert message={error} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="panel overflow-hidden p-0">
          <div className="border-b border-ops-border px-4 py-2 text-xs text-slate-400">
            <MapPin className="mr-1 inline h-3.5 w-3.5" />
            Click map to pick coordinates {position && `( ${lat.toFixed(5)}, ${lng.toFixed(5)} )`}
          </div>
          <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} className="h-56 w-full">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <MapPicker position={position} onPick={onMapPick} />
          </MapContainer>
        </div>

        {result && (
          <div className="space-y-3">
            <div className="panel p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Submission result</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold capitalize text-white">{result.report.damageType}</span>
                <SeverityBadge severity={result.report.severity} />
                <span className="font-mono text-xs text-accent-cyan">ID {result.report.id?.slice(-8)}</span>
              </div>
            </div>
            <DetectionPreview
              title="AI inference output"
              previewUrl={preview}
              serverImageUrl={result.report.imageUrl}
              detections={result.report.detections?.length ? result.report.detections : result.detectionMeta?.detections}
              width={result.detectionMeta?.width}
              height={result.detectionMeta?.height}
            />
          </div>
        )}
      </div>
    </div>
  );
}
