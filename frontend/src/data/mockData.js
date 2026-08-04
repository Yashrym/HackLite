/** Colombo metro — demo coordinates */
export const MAP_CENTER = [6.9271, 79.8612];
export const MAP_ZOOM = 12;

export const MOCK_REPORTS = [
  {
    id: 'mock-1',
    imageUrl: '',
    latitude: 6.9342,
    longitude: 79.8428,
    damageType: 'pothole',
    confidence: 0.91,
    severity: 'critical',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'pending',
    description: 'Deep pothole near school crossing',
    detections: [{ damage_type: 'pothole', confidence: 0.91, bbox: [40, 60, 180, 200] }],
  },
  {
    id: 'mock-2',
    imageUrl: '',
    latitude: 6.9155,
    longitude: 79.8721,
    damageType: 'crack',
    confidence: 0.72,
    severity: 'high',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: 'assigned',
    description: 'Alligator cracking on arterial lane',
    detections: [{ damage_type: 'crack', confidence: 0.72, bbox: [20, 30, 220, 140] }],
  },
  {
    id: 'mock-3',
    imageUrl: '',
    latitude: 6.921,
    longitude: 79.855,
    damageType: 'blocked',
    confidence: 0.88,
    severity: 'critical',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: 'pending',
    description: 'Fallen debris — Cyclone Ditwa response route',
    detections: [{ damage_type: 'blocked', confidence: 0.88, bbox: [10, 10, 240, 180] }],
  },
  {
    id: 'mock-4',
    imageUrl: '',
    latitude: 6.908,
    longitude: 79.861,
    damageType: 'pothole',
    confidence: 0.55,
    severity: 'low',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'resolved',
    description: 'Minor surface wear',
    detections: [{ damage_type: 'pothole', confidence: 0.55, bbox: [80, 90, 160, 150] }],
  },
  {
    id: 'mock-5',
    imageUrl: '',
    latitude: 6.938,
    longitude: 79.878,
    damageType: 'crack',
    confidence: 0.67,
    severity: 'high',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    status: 'pending',
    description: 'Hospital access road surface failure',
    detections: [{ damage_type: 'crack', confidence: 0.67, bbox: [30, 40, 200, 160] }],
  },
];

export const MOCK_STATS = {
  totalReports: 128,
  criticalReports: 14,
  resolved: 76,
  pending: 39,
  bySeverity: { low: 52, high: 62, critical: 14 },
  byDamageType: { pothole: 58, crack: 47, blocked: 12, infrastructure: 11 },
  dailyReports: [
    { date: '2026-07-28', count: 11 },
    { date: '2026-07-29', count: 15 },
    { date: '2026-07-30', count: 18 },
    { date: '2026-07-31', count: 22 },
    { date: '2026-08-01', count: 19 },
    { date: '2026-08-02', count: 24 },
    { date: '2026-08-03', count: 19 },
  ],
};

export const EMERGENCY_ROUTES = [
  {
    id: 'hospital-a',
    name: 'National Hospital Corridor',
    coords: [
      [6.915, 79.865],
      [6.922, 79.858],
      [6.928, 79.852],
    ],
  },
  {
    id: 'relief-b',
    name: 'Cyclone Ditwa Relief Route B',
    coords: [
      [6.905, 79.87],
      [6.918, 79.862],
      [6.932, 79.848],
    ],
  },
];

export const AFFECTED_ZONES = [
  { center: [6.921, 79.855], radiusM: 650, label: 'Zone Alpha — critical cluster' },
  { center: [6.934, 79.843], radiusM: 420, label: 'Western access choke point' },
];
