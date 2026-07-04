// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Wesley Cordeiro de Araujo
// See NOTICE for additional attribution and origin notices.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  OFFLINE_STORAGE_CHANGED_EVENT
} from '../../db/localDb';
import {
  requeueTransientFailedQueueItems
} from '../../db/offlineSyncIssues';
import type {
  SyncRunResult
} from '../../db/localTypes';
import {
  syncPendingOfflineData
} from '../../features/sync/syncService';

type ApiHealthStatus =
  | 'checking'
  | 'online'
  | 'offline';

type SyncEngineState = {
  isSyncing: boolean;
  lastResult: SyncRunResult | null;
  lastAttemptAt: string | null;
  nextSyncInSeconds: number;
};

const CHECK_INTERVAL_SECONDS = 180;

const STORAGE_CHANGE_RETRY_COOLDOWN_MS =
  CHECK_INTERVAL_SECONDS * 1000;

function isManualSyncReason(
  reason: string
): boolean {
  return (
    reason === 'manual' ||
    reason ===
      'manual-connection-check' ||
    reason ===
      'sync-issues-panel'
  );
}

function shouldPrepareTransientFailures(
  reason: string
): boolean {
  return (
    isManualSyncReason(reason) ||
    reason === 'network-ready' ||
    reason === 'interval-3-minutes'
  );
}

function createSkippedResult(
  message: string
): SyncRunResult {
  return {
    status: 'skipped',
    message,
    totalLocations: 0,
    totalSupplies: 0,
    totalDemands: 0,
    acceptedLocations: 0,
    acceptedSupplies: 0,
    acceptedDemands: 0,
    rejectedItems: 0,
    duplicateItems: 0
  };
}

export function useSyncEngine(
  isOnline: boolean,
  apiStatus: ApiHealthStatus
) {
  const [
    state,
    setState
  ] = useState<SyncEngineState>({
    isSyncing: false,
    lastResult: null,
    lastAttemptAt: null,
    nextSyncInSeconds:
      CHECK_INTERVAL_SECONDS
  });

  const isEligible =
    isOnline &&
    apiStatus === 'online';

  const isEligibleRef =
    useRef(isEligible);

  const isSyncingRef =
    useRef(false);

  const storageChangeBlockedUntilRef =
    useRef(0);

  useEffect(() => {
    isEligibleRef.current =
      isEligible;
  }, [isEligible]);

  const resetCountdown =
    useCallback(() => {
      setState((current) => ({
        ...current,
        nextSyncInSeconds:
          CHECK_INTERVAL_SECONDS
      }));
    }, []);

  const syncNow = useCallback(
    async (
      reason: string = 'manual'
    ): Promise<SyncRunResult> => {
      const isManual =
        isManualSyncReason(reason);

      if (
        !isEligibleRef.current
      ) {
        const result =
          createSkippedResult(
            'Sincronização ignorada: dispositivo offline ou API indisponível.'
          );

        if (isManual) {
          setState((current) => ({
            ...current,
            lastResult: result,
            lastAttemptAt:
              new Date().toISOString(),
            nextSyncInSeconds:
              CHECK_INTERVAL_SECONDS
          }));
        }

        return result;
      }

      /*
       * Only storage-change retries respect
       * the transient failure cooldown.
       *
       * The normal 3-minute interval,
       * network-ready and manual actions
       * remain allowed.
       */
      if (
        reason === 'storage-change' &&
        Date.now() <
          storageChangeBlockedUntilRef.current
      ) {
        return createSkippedResult(
          'Nova tentativa automática aguardando o próximo ciclo de sincronização.'
        );
      }

      if (
        isSyncingRef.current
      ) {
        return createSkippedResult(
          'Uma sincronização já está em andamento.'
        );
      }

      isSyncingRef.current = true;

      setState((current) => ({
        ...current,
        isSyncing: true,
        lastAttemptAt:
          new Date().toISOString(),
        nextSyncInSeconds:
          CHECK_INTERVAL_SECONDS
      }));

      let result: SyncRunResult;

      try {
        /*
         * A transient infrastructure failure
         * must become pending again before
         * createOfflineSyncBatchPayload().
         */
        if (
          shouldPrepareTransientFailures(
            reason
          )
        ) {
          await requeueTransientFailedQueueItems();
        }

        result =
          await syncPendingOfflineData(
            reason
          );
      } finally {
        isSyncingRef.current = false;
      }

      if (
        result.status === 'failed'
      ) {
        storageChangeBlockedUntilRef.current =
          Date.now() +
          STORAGE_CHANGE_RETRY_COOLDOWN_MS;
      } else if (
        result.status === 'success' ||
        result.status === 'partial' ||
        result.status === 'idle'
      ) {
        storageChangeBlockedUntilRef.current =
          0;
      }

      setState((current) => {
        if (
          result.status === 'idle' &&
          !isManual
        ) {
          return {
            ...current,
            isSyncing: false,
            lastAttemptAt:
              new Date().toISOString(),
            nextSyncInSeconds:
              CHECK_INTERVAL_SECONDS
          };
        }

        return {
          isSyncing: false,
          lastResult: result,
          lastAttemptAt:
            new Date().toISOString(),
          nextSyncInSeconds:
            CHECK_INTERVAL_SECONDS
        };
      });

      return result;
    },
    []
  );

  useEffect(() => {
    if (!isEligible) {
      resetCountdown();
      return;
    }

    const timeoutId =
      window.setTimeout(() => {
        void syncNow(
          'network-ready'
        );
      }, 800);

    return () => {
      window.clearTimeout(
        timeoutId
      );
    };
  }, [
    isEligible,
    resetCountdown,
    syncNow
  ]);

  useEffect(() => {
    const intervalId =
      window.setInterval(() => {
        setState((current) => {
          if (
            current.nextSyncInSeconds <= 1
          ) {
            window.setTimeout(() => {
              /*
               * The normal interval is allowed
               * to retry transient failed items.
               */
              void syncNow(
                'interval-3-minutes'
              );
            }, 0);

            return {
              ...current,
              nextSyncInSeconds:
                CHECK_INTERVAL_SECONDS
            };
          }

          return {
            ...current,
            nextSyncInSeconds:
              current.nextSyncInSeconds - 1
          };
        });
      }, 1000);

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [syncNow]);

  useEffect(() => {
    let timeoutId:
      number | null = null;

    function handleStorageChanged():
    void {
      if (
        !isEligibleRef.current
      ) {
        return;
      }

      /*
       * Pending -> Syncing -> Failed/Synced
       * can be caused by the sync itself.
       */
      if (
        isSyncingRef.current
      ) {
        return;
      }

      /*
       * A failed automatic sync must not feed
       * an infinite storage-change loop.
       */
      if (
        Date.now() <
        storageChangeBlockedUntilRef.current
      ) {
        return;
      }

      if (
        timeoutId !== null
      ) {
        window.clearTimeout(
          timeoutId
        );
      }

      timeoutId =
        window.setTimeout(() => {
          void syncNow(
            'storage-change'
          );
        }, 1200);
    }

    window.addEventListener(
      OFFLINE_STORAGE_CHANGED_EVENT,
      handleStorageChanged
    );

    return () => {
      if (
        timeoutId !== null
      ) {
        window.clearTimeout(
          timeoutId
        );
      }

      window.removeEventListener(
        OFFLINE_STORAGE_CHANGED_EVENT,
        handleStorageChanged
      );
    };
  }, [syncNow]);

  const progressPercent =
    useMemo(() => {
      return Math.round(
        (
          (
            CHECK_INTERVAL_SECONDS -
            state.nextSyncInSeconds
          ) /
          CHECK_INTERVAL_SECONDS
        ) * 100
      );
    }, [
      state.nextSyncInSeconds
    ]);

  return {
    ...state,
    canSync: isEligible,
    progressPercent,
    syncNow
  };
}