/** Mock emergency corridors for Disaster Mode overlay */
export const EMERGENCY_ROUTES = [
  {
    id: 'route-a',
    name: 'Hospital Corridor A',
    coords: [
      [28.6139, 77.209],
      [28.6155, 77.215],
      [28.618, 77.22],
    ],
  },
  {
    id: 'route-b',
    name: 'Relief Route B',
    coords: [
      [28.61, 77.205],
      [28.612, 77.212],
      [28.616, 77.218],
    ],
  },
];

export const AFFECTED_ZONES = [
  { center: [28.6145, 77.213], radiusM: 800, label: 'Sector 7 — Critical cluster' },
  { center: [28.617, 77.217], radiusM: 500, label: 'Ring Road junction' },
];
