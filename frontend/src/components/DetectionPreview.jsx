import { mediaUrl } from '../services/api';
import { pct } from '../utils/format';

export default function DetectionPreview({ previewUrl, serverImageUrl, detections = [], width, height, title }) {
  const src = previewUrl || mediaUrl(serverImageUrl);

  return (
    <div className="panel p-4">
      {title && <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">Original</p>
          {src ? (
            <img src={src} alt="Original" className="max-h-64 w-full rounded-lg border border-ops-border object-contain bg-ops-bg" />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-ops-border text-slate-500">
              No image
            </div>
          )}
        </div>
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">YOLO annotated</p>
          <div className="relative inline-block max-w-full overflow-hidden rounded-lg border border-ops-border bg-ops-bg">
            {src && (
              <>
                <img src={src} alt="Annotated" className="max-h-64 w-full object-contain" />
                {width && height && detections?.length > 0 && (
                  <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                    {detections.map((d, i) => {
                      const [x1, y1, x2, y2] = d.bbox || [];
                      const label = `${d.damage_type ?? d.damageType} ${pct(d.confidence)}`;
                      return (
                        <g key={i}>
                          <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} fill="none" stroke="#f59e0b" strokeWidth={3} />
                          <text x={x1} y={Math.max(14, y1 - 4)} fill="#fbbf24" fontSize={12}>
                            {label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {detections?.length > 0 && (
        <ul className="mt-3 divide-y divide-ops-border rounded-lg border border-ops-border text-xs">
          {detections.map((d, i) => (
            <li key={i} className="flex justify-between px-3 py-2 capitalize text-slate-300">
              <span>{d.damage_type ?? d.damageType}</span>
              <span className="font-mono text-accent-cyan">{pct(d.confidence)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
