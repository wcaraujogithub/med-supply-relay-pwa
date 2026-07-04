/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL =
  typeof rawBaseUrl === 'string' && rawBaseUrl.trim().length > 0
    ? rawBaseUrl.trim().replace(/\/$/, '')
    : 'http://localhost:5484';

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  matches: `${API_BASE_URL}/api/v1/matches`,
  reservations: `${API_BASE_URL}/api/v1/reservations`,
  exportMatchesCsv: `${API_BASE_URL}/api/v1/export/matches.csv`,
  exportMatchesTxt: `${API_BASE_URL}/api/v1/export/matches.txt`,
  syncBatch: `${API_BASE_URL}/api/v1/sync/batch`
} as const;