import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SEVERITY_COLORS } from '../utils/format';
import { AFFECTED_ZONES, EMERGENCY_ROUTES } from '../utils/disasterMock';

// Fix default marker icons in bundlers
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: iconRetina, iconUrl: icon, shadowUrl: shadow });

function severityIcon(severity) {
  const color = SEVERITY_COLORS[severity] || '#64748b';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function FitBounds({ reports }) {
  const map = useMap();
  useEffect(() => {
    if (!reports?.length) return;
    const bounds = L.latLngBounds(reports.map((r) => [r.latitude, r.longitude]));
    map.fitBounds(bounds.pad(0.15));
  }, [map, reports]);
  return null;
}

export default function ReportsMap({
  reports = [],
  center = [28.6139, 77.209],
  zoom = 12,
  disasterMode = false,
  heightClass = 'h-[480px]',
}) {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 ${heightClass}`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.length > 0 && <FitBounds reports={reports} />}
        {reports.map((r) => (
          <Marker key={r.id} position={[r.latitude, r.longitude]} icon={severityIcon(r.severity)}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold capitalize">{r.damageType}</p>
                <p>Severity: {r.severity}</p>
                <p>Status: {r.status}</p>
                <p>Confidence: {(r.confidence * 100).toFixed(0)}%</p>
              </div>
            </Popup>
          </Marker>
        ))}
        {disasterMode &&
          EMERGENCY_ROUTES.map((route) => (
            <Polyline
              key={route.id}
              positions={route.coords}
              pathOptions={{ color: '#2563eb', weight: 5, dashArray: '8 8' }}
            />
          ))}
        {disasterMode &&
          AFFECTED_ZONES.map((zone, i) => (
            <Circle
              key={i}
              center={zone.center}
              radius={zone.radiusM}
              pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.12, weight: 2 }}
            />
          ))}
      </MapContainer>
    </div>
  );
}
