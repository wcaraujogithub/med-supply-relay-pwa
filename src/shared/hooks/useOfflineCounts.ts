/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  OFFLINE_STORAGE_CHANGED_EVENT
} from '../../db/localDb';
import {
  getOfflineCounts
} from '../../db/offlineQueue';
import type { OfflineCounts } from '../../db/localTypes';

const emptyCounts: OfflineCounts = {
  pendingLocations: 0,
  pendingSupplies: 0,
  pendingDemands: 0,
  failedLocations: 0,
  failedSupplies: 0,
  failedDemands: 0,
  syncingLocations: 0,
  syncingSupplies: 0,
  syncingDemands: 0,
  syncedLocations: 0,
  syncedSupplies: 0,
  syncedDemands: 0,
  totalLocations: 0,
  totalSupplies: 0,
  totalDemands: 0
};

export function useOfflineCounts() {
  const [counts, setCounts] = useState<OfflineCounts>(emptyCounts);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const nextCounts = await getOfflineCounts();
      setCounts(nextCounts);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    window.addEventListener(OFFLINE_STORAGE_CHANGED_EVENT, refresh);

    return () => {
      window.removeEventListener(OFFLINE_STORAGE_CHANGED_EVENT, refresh);
    };
  }, [refresh]);

  return {
    counts,
    isLoading,
    refresh
  };
}