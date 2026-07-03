// import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { OFFLINE_STORAGE_CHANGED_EVENT } from '../../db/localDb';
// import type { SyncRunResult } from '../../db/localTypes';
// import { syncPendingOfflineData } from '../../features/sync/syncService';

// type ApiHealthStatus = 'checking' | 'online' | 'offline';

// type SyncEngineState = {
//   isSyncing: boolean;
//   lastResult: SyncRunResult | null;
//   lastAttemptAt: string | null;
//   nextSyncInSeconds: number;
// };

// const CHECK_INTERVAL_SECONDS = 180;

// export function useSyncEngine(
//   isOnline: boolean,
//   apiStatus: ApiHealthStatus
// ) {
//   const [state, setState] = useState<SyncEngineState>({
//     isSyncing: false,
//     lastResult: null,
//     lastAttemptAt: null,
//     nextSyncInSeconds: CHECK_INTERVAL_SECONDS
//   });

//   const isEligible = isOnline && apiStatus === 'online';
//   const isEligibleRef = useRef(isEligible);

//   useEffect(() => {
//     isEligibleRef.current = isEligible;
//   }, [isEligible]);

//   const resetCountdown = useCallback(() => {
//     setState((current) => ({
//       ...current,
//       nextSyncInSeconds: CHECK_INTERVAL_SECONDS
//     }));
//   }, []);

//   const syncNow = useCallback(
//     async (reason: string = 'manual') => {
//       if (!isEligibleRef.current) {
//         const result: SyncRunResult = {
//           status: 'skipped',
//           message:
//             'Sincronização ignorada: dispositivo offline ou API indisponível.',
//           totalLocations: 0,
//           totalSupplies: 0,
//           totalDemands: 0,
//           acceptedLocations: 0,
//           acceptedSupplies: 0,
//           acceptedDemands: 0,
//           rejectedItems: 0,
//           duplicateItems: 0
//         };

//         if (reason === 'manual' || reason === 'manual-connection-check') {
//           setState((current) => ({
//             ...current,
//             lastResult: result,
//             lastAttemptAt: new Date().toISOString(),
//             nextSyncInSeconds: CHECK_INTERVAL_SECONDS
//           }));
//         }

//         return result;
//       }

//       setState((current) => ({
//         ...current,
//         isSyncing: true,
//         lastAttemptAt: new Date().toISOString(),
//         nextSyncInSeconds: CHECK_INTERVAL_SECONDS
//       }));

//       const result = await syncPendingOfflineData(reason);

//       setState((current) => {
//         if (result.status === 'idle' && reason !== 'manual') {
//           return {
//             ...current,
//             isSyncing: false,
//             lastAttemptAt: new Date().toISOString(),
//             nextSyncInSeconds: CHECK_INTERVAL_SECONDS
//           };
//         }

//         return {
//           isSyncing: false,
//           lastResult: result,
//           lastAttemptAt: new Date().toISOString(),
//           nextSyncInSeconds: CHECK_INTERVAL_SECONDS
//         };
//       });

//       return result;
//     },
//     []
//   );

//   useEffect(() => {
//     if (!isEligible) {
//       resetCountdown();
//       return;
//     }

//     const timeoutId = window.setTimeout(() => {
//       void syncNow('network-ready');
//     }, 800);

//     return () => {
//       window.clearTimeout(timeoutId);
//     };
//   }, [isEligible, resetCountdown, syncNow]);

//   useEffect(() => {
//     const intervalId = window.setInterval(() => {
//       setState((current) => {
//         if (current.nextSyncInSeconds <= 1) {
//           window.setTimeout(() => {
//             void syncNow('interval-3-minutes');
//           }, 0);

//           return {
//             ...current,
//             nextSyncInSeconds: CHECK_INTERVAL_SECONDS
//           };
//         }

//         return {
//           ...current,
//           nextSyncInSeconds: current.nextSyncInSeconds - 1
//         };
//       });
//     }, 1000);

//     return () => {
//       window.clearInterval(intervalId);
//     };
//   }, [syncNow]);

//   useEffect(() => {
//     let timeoutId: number | null = null;

//     function handleStorageChanged(): void {
//       if (!isEligibleRef.current) {
//         return;
//       }

//       if (timeoutId !== null) {
//         window.clearTimeout(timeoutId);
//       }

//       timeoutId = window.setTimeout(() => {
//         void syncNow('storage-change');
//       }, 1200);
//     }

//     window.addEventListener(
//       OFFLINE_STORAGE_CHANGED_EVENT,
//       handleStorageChanged
//     );

//     return () => {
//       if (timeoutId !== null) {
//         window.clearTimeout(timeoutId);
//       }

//       window.removeEventListener(
//         OFFLINE_STORAGE_CHANGED_EVENT,
//         handleStorageChanged
//       );
//     };
//   }, [syncNow]);

//   const progressPercent = useMemo(() => {
//     return Math.round(
//       ((CHECK_INTERVAL_SECONDS - state.nextSyncInSeconds) /
//         CHECK_INTERVAL_SECONDS) *
//         100
//     );
//   }, [state.nextSyncInSeconds]);

//   return {
//     ...state,
//     canSync: isEligible,
//     progressPercent,
//     syncNow
//   };
// }

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OFFLINE_STORAGE_CHANGED_EVENT } from '../../db/localDb';
import type { SyncRunResult } from '../../db/localTypes';
import { syncPendingOfflineData } from '../../features/sync/syncService';

type ApiHealthStatus = 'checking' | 'online' | 'offline';

type SyncEngineState = {
  isSyncing: boolean;
  lastResult: SyncRunResult | null;
  lastAttemptAt: string | null;
  nextSyncInSeconds: number;
};

const CHECK_INTERVAL_SECONDS = 180;

export function useSyncEngine(
  isOnline: boolean,
  apiStatus: ApiHealthStatus
) {
  const [state, setState] = useState<SyncEngineState>({
    isSyncing: false,
    lastResult: null,
    lastAttemptAt: null,
    nextSyncInSeconds: CHECK_INTERVAL_SECONDS
  });

  const isEligible = isOnline && apiStatus === 'online';
  const isEligibleRef = useRef(isEligible);

  useEffect(() => {
    isEligibleRef.current = isEligible;
  }, [isEligible]);

  const resetCountdown = useCallback(() => {
    setState((current) => ({
      ...current,
      nextSyncInSeconds: CHECK_INTERVAL_SECONDS
    }));
  }, []);

  const syncNow = useCallback(
    async (reason: string = 'manual') => {
      if (!isEligibleRef.current) {
        const result: SyncRunResult = {
          status: 'skipped',
          message:
            'Sincronização ignorada: dispositivo offline ou API indisponível.',
          totalLocations: 0,
          totalSupplies: 0,
          totalDemands: 0,
          acceptedLocations: 0,
          acceptedSupplies: 0,
          acceptedDemands: 0,
          rejectedItems: 0,
          duplicateItems: 0
        };

        if (reason === 'manual' || reason === 'manual-connection-check') {
          setState((current) => ({
            ...current,
            lastResult: result,
            lastAttemptAt: new Date().toISOString(),
            nextSyncInSeconds: CHECK_INTERVAL_SECONDS
          }));
        }

        return result;
      }

      setState((current) => ({
        ...current,
        isSyncing: true,
        lastAttemptAt: new Date().toISOString(),
        nextSyncInSeconds: CHECK_INTERVAL_SECONDS
      }));

      const result = await syncPendingOfflineData(reason);

      setState((current) => {
        if (result.status === 'idle' && reason !== 'manual') {
          return {
            ...current,
            isSyncing: false,
            lastAttemptAt: new Date().toISOString(),
            nextSyncInSeconds: CHECK_INTERVAL_SECONDS
          };
        }

        return {
          isSyncing: false,
          lastResult: result,
          lastAttemptAt: new Date().toISOString(),
          nextSyncInSeconds: CHECK_INTERVAL_SECONDS
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

    const timeoutId = window.setTimeout(() => {
      void syncNow('network-ready');
    }, 800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isEligible, resetCountdown, syncNow]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setState((current) => {
        if (current.nextSyncInSeconds <= 1) {
          window.setTimeout(() => {
            void syncNow('interval-3-minutes');
          }, 0);

          return {
            ...current,
            nextSyncInSeconds: CHECK_INTERVAL_SECONDS
          };
        }

        return {
          ...current,
          nextSyncInSeconds: current.nextSyncInSeconds - 1
        };
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [syncNow]);

  useEffect(() => {
    let timeoutId: number | null = null;

    function handleStorageChanged(): void {
      if (!isEligibleRef.current) {
        return;
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        void syncNow('storage-change');
      }, 1200);
    }

    window.addEventListener(
      OFFLINE_STORAGE_CHANGED_EVENT,
      handleStorageChanged
    );

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      window.removeEventListener(
        OFFLINE_STORAGE_CHANGED_EVENT,
        handleStorageChanged
      );
    };
  }, [syncNow]);

  const progressPercent = useMemo(() => {
    return Math.round(
      ((CHECK_INTERVAL_SECONDS - state.nextSyncInSeconds) /
        CHECK_INTERVAL_SECONDS) *
        100
    );
  }, [state.nextSyncInSeconds]);

  return {
    ...state,
    canSync: isEligible,
    progressPercent,
    syncNow
  };
}