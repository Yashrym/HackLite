import axios from 'axios';
import { MOCK_REPORTS, MOCK_STATS } from '../data/mockData';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

/** UI labels mapped to FastAPI enum values */
export const STATUS_TO_API = {
  Pending: 'pending',
  'In Progress': 'assigned',
  Resolved: 'resolved',
  Duplicate: 'duplicate',
};

export const API_TO_STATUS = {
  pending: 'Pending',
  assigned: 'In Progress',
  resolved: 'Resolved',
  duplicate: 'Duplicate',
};

export const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved', 'Duplicate'];

let offlineNotified = false;

function markOffline() {
  if (!offlineNotified) {
    offlineNotified = true;
    console.warn('[VisionRoute] API unreachable — using mock data fallback.');
  }
  return true;
}

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function fetchReports(params = {}) {
  try {
    const { data } = await api.get('/reports', { params });
    return { data, offline: false };
  } catch {
    markOffline();
    let list = [...MOCK_REPORTS];
    if (params.criticalOnly || params.severity === 'critical') {
      list = list.filter((r) => r.severity === 'critical');
    } else if (params.severity) {
      list = list.filter((r) => r.severity === params.severity);
    }
    if (params.status) {
      list = list.filter((r) => r.status === params.status);
    }
    return { data: list, offline: true };
  }
}

export async function fetchReport(id) {
  try {
    const { data } = await api.get(`/reports/${id}`);
    return { data, offline: false };
  } catch {
    markOffline();
    const found = MOCK_REPORTS.find((r) => r.id === id);
    if (!found) throw new Error('Report not found');
    return { data: found, offline: true };
  }
}

export async function updateReportStatus(id, uiStatus) {
  const status = STATUS_TO_API[uiStatus] || uiStatus;
  try {
    const { data } = await api.patch(`/reports/${id}/status`, { status });
    return { data, offline: false };
  } catch {
    markOffline();
    const idx = MOCK_REPORTS.findIndex((r) => r.id === id);
    if (idx >= 0) {
      MOCK_REPORTS[idx] = { ...MOCK_REPORTS[idx], status };
    }
    return { data: MOCK_REPORTS[idx] || { id, status }, offline: true };
  }
}

export async function fetchStatistics() {
  try {
    const { data } = await api.get('/reports/statistics/summary');
    return { data, offline: false };
  } catch {
    markOffline();
    return { data: { ...MOCK_STATS }, offline: true };
  }
}

/** Multipart: file + latitude + longitude + optional description — runs YOLO on server */
export async function submitReportMultipart({ file, latitude, longitude, description }) {
  const form = new FormData();
  form.append('file', file);
  form.append('latitude', String(latitude));
  form.append('longitude', String(longitude));
  if (description) form.append('description', description);

  const { data } = await api.post('/reports', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** Optional pre-submit inference preview */
export async function detectImage(file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/reports/detect', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
