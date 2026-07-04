/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';

type ApiHealthStatus = 'checking' | 'online' | 'offline';

type HealthResponse = {
  status: string;
  service: string;
  environment: string;
  utc: string;
};

const CHECK_INTERVAL_SECONDS = 180;

export function useApiHealth(isOnline: boolean) {
  const [status, setStatus] = useState<ApiHealthStatus>('checking');
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [serviceUtc, setServiceUtc] = useState<string | null>(null);
  const [nextCheckInSeconds, setNextCheckInSeconds] = useState(
    CHECK_INTERVAL_SECONDS
  );

  const isCheckingRef = useRef(false);

  const checkHealth = useCallback(async () => {
    if (isCheckingRef.current) {
      return;
    }

    if (!isOnline) {
      setStatus('offline');
      setLastCheckedAt(new Date().toISOString());
      setNextCheckInSeconds(CHECK_INTERVAL_SECONDS);
      return;
    }

    isCheckingRef.current = true;
    setStatus('checking');

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 5000);

      const response = await fetch(API_ENDPOINTS.health, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json'
        }
      });

      window.clearTimeout(timeoutId);

      if (!response.ok) {
        setStatus('offline');
        setLastCheckedAt(new Date().toISOString());
        setNextCheckInSeconds(CHECK_INTERVAL_SECONDS);
        return;
      }

      const data = (await response.json()) as HealthResponse;

      setStatus(data.status === 'ok' ? 'online' : 'offline');
      setServiceUtc(data.utc ?? null);
      setLastCheckedAt(new Date().toISOString());
      setNextCheckInSeconds(CHECK_INTERVAL_SECONDS);
    } catch {
      setStatus('offline');
      setLastCheckedAt(new Date().toISOString());
      setNextCheckInSeconds(CHECK_INTERVAL_SECONDS);
    } finally {
      isCheckingRef.current = false;
    }
  }, [isOnline]);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNextCheckInSeconds((current) => {
        if (current <= 1) {
          window.setTimeout(() => void checkHealth(), 0);
          return CHECK_INTERVAL_SECONDS;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [checkHealth]);

  const progressPercent = useMemo(() => {
    return Math.round(
      ((CHECK_INTERVAL_SECONDS - nextCheckInSeconds) /
        CHECK_INTERVAL_SECONDS) *
        100
    );
  }, [nextCheckInSeconds]);

  return {
    status,
    lastCheckedAt,
    serviceUtc,
    nextCheckInSeconds,
    progressPercent,
    checkHealth
  };
}