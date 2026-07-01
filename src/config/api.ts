const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL =
  typeof rawBaseUrl === 'string' && rawBaseUrl.trim().length > 0
    ? rawBaseUrl.trim().replace(/\/$/, '')
    : 'http://localhost:5484';

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  matches: `${API_BASE_URL}/api/v1/matches`,
  exportMatchesCsv: `${API_BASE_URL}/api/v1/export/matches.csv`,
  exportMatchesTxt: `${API_BASE_URL}/api/v1/export/matches.txt`,
  syncBatch: `${API_BASE_URL}/api/v1/sync/batch`
} as const;