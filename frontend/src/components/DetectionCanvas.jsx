import { uploadsUrl } from '../services/api';

/**
 * Draws YOLO bounding boxes over an uploaded image preview.
 */
export default function DetectionCanvas({ imageSrc, detections = [], width, height }) {
  const src = imageSrc?.startsWith('blob:') ? imageSrc : uploadsUrl(imageSrc);

  return (
    <div className="relative inline-block max-w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <img src={src} alt="Detection preview" className="max-h-[420px] w-full object-contain" />
      {width && height && detections.length > 0 && (
        <svg
          className="pointer-events-none absolute left-0 top-0 h-full w-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {detections.map((d, i) => {
            const [x1, y1, x2, y2] = d.bbox;
            const label = `${d.damage_type ?? d.damageType} ${(d.confidence * 100).toFixed(0)}%`;
            return (
              <g key={i}>
                <rect
                  x={x1}
                  y={y1}
                  width={x2 - x1}
                  height={y2 - y1}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={Math.max(2, width / 400)}
                />
                <rect x={x1} y={Math.max(0, y1 - 22)} width={label.length * 7 + 12} height={20} fill="#0f172a" opacity={0.85} />
                <text x={x1 + 4} y={Math.max(14, y1 - 8)} fill="#fbbf24" fontSize={14} fontFamily="sans-serif">
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
