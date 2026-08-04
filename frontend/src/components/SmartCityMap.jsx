import { useEffect, useMemo } from 'react';
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AFFECTED_ZONES, EMERGENCY_ROUTES, MAP_CENTER, MAP_ZOOM } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { damageColor, formatTimestamp } from '../utils/format';
import { mediaUrl } from '../services/api';
import SeverityBadge from './SeverityBadge';

import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: iconRetina, iconUrl: icon, shadowUrl: shadow });

function damageIcon(type, highlighted) {
  const color = damageColor(type);
  const size = highlighted ? 18 : 14;
  return L.divIcon({
    className: 'custom-marker-wrap',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid ${highlighted ? '#fff' : '#0f172a'};box-shadow:0 0 ${highlighted ? 12 : 6}px ${color}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function clusterIcon(count) {
  return L.divIcon({
    className: 'custom-marker-wrap',
    html: `<div style="min-width:28px;height:28px;padding:0 6px;border-radius:14px;background:#06b6d4;color:#020617;font:bold 12px/28px sans-serif;text-align:center;border:2px solid #0f172a">${count}</div>`,
    iconAnchor: [14, 14],
  });
}

/** Simple grid clustering (~0.008 deg) */
function clusterReports(reports) {
  const cell = 0.008;
  const groups = new Map();
  for (const r of reports) {
    const key = `${Math.round(r.latitude / cell)}_${Math.round(r.longitude / cell)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  return [...groups.values()];
}

function FlyToHighlight({ report }) {
  const map = useMap();
  useEffect(() => {
    if (report) {
      map.flyTo([report.latitude, report.longitude], 15, { duration: 0.8 });
    }
  }, [map, report]);
  return null;
}

export default function SmartCityMap({ reports = [], className = 'h-[520px]' }) {
  const { disasterMode, mapHeatmap, mapCluster, highlightReportId } = useApp();

  const highlighted = useMemo(
    () => reports.find((r) => r.id === highlightReportId),
    [reports, highlightReportId],
  );

  const clusters = useMemo(() => (mapCluster ? clusterReports(reports) : reports.map((r) => [r])), [reports, mapCluster]);

  return (
    <div className={`overflow-hidden rounded-xl border border-ops-border ${className}`}>
      <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <FlyToHighlight report={highlighted} />

        {mapHeatmap &&
          reports.map((r) => (
            <Circle
              key={`heat-${r.id}`}
              center={[r.latitude, r.longitude]}
              radius={r.severity === 'critical' ? 280 : 180}
              pathOptions={{
                color: damageColor(r.damageType),
                fillColor: damageColor(r.damageType),
                fillOpacity: 0.15,
                weight: 0,
              }}
            />
          ))}

        {disasterMode &&
          EMERGENCY_ROUTES.map((route) => (
            <Polyline
              key={route.id}
              positions={route.coords}
              pathOptions={{ color: '#3b82f6', weight: 6, dashArray: '10 8', opacity: 0.9 }}
            />
          ))}
        {disasterMode &&
          AFFECTED_ZONES.map((zone, i) => (
            <Circle
              key={`zone-${i}`}
              center={zone.center}
              radius={zone.radiusM}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.12, weight: 2 }}
            />
          ))}

        {mapCluster
          ? clusters.map((group, i) => {
              if (group.length === 1) {
                const r = group[0];
                return (
                  <Marker
                    key={r.id}
                    position={[r.latitude, r.longitude]}
                    icon={damageIcon(r.damageType, r.id === highlightReportId)}
                  >
                    <Popup>
                      <ReportPopup report={r} />
                    </Popup>
                  </Marker>
                );
              }
              const lat = group.reduce((s, r) => s + r.latitude, 0) / group.length;
              const lng = group.reduce((s, r) => s + r.longitude, 0) / group.length;
              return (
                <Marker key={`c-${i}`} position={[lat, lng]} icon={clusterIcon(group.length)}>
                  <Popup>
                    <p className="text-xs font-semibold">{group.length} reports in zone</p>
                  </Popup>
                </Marker>
              );
            })
          : reports.map((r) => (
              <Marker
                key={r.id}
                position={[r.latitude, r.longitude]}
                icon={damageIcon(r.damageType, r.id === highlightReportId)}
              >
                <Popup>
                  <ReportPopup report={r} />
                </Popup>
              </Marker>
            ))}
      </MapContainer>
    </div>
  );
}

function ReportPopup({ report }) {
  const thumb = mediaUrl(report.imageUrl);
  return (
    <div className="min-w-[180px] text-sm">
      {report.imageUrl ? (
        <img src={thumb} alt="" className="mb-2 h-20 w-full rounded object-cover" />
      ) : null}
      <p className="font-semibold capitalize text-white">{report.damageType}</p>
      <SeverityBadge severity={report.severity} />
      <p className="mt-1 text-xs text-slate-400">{formatTimestamp(report.timestamp)}</p>
    </div>
  );
}
