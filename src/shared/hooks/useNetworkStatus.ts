// import { useEffect, useState } from 'react';

// export function useNetworkStatus(): boolean {
//   const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);

//   useEffect(() => {
//     function handleOnline(): void {
//       setIsOnline(true);
//     }

//     function handleOffline(): void {
//       setIsOnline(false);
//     }

//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);

//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   return isOnline;
// }

import { useCallback, useEffect, useMemo, useState } from 'react';

const CHECK_INTERVAL_SECONDS = 180;

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
  const [lastCheckedAt, setLastCheckedAt] = useState<string>(() =>
    new Date().toISOString()
  );
  const [nextCheckInSeconds, setNextCheckInSeconds] = useState(
    CHECK_INTERVAL_SECONDS
  );

  const checkNow = useCallback(() => {
    setIsOnline(navigator.onLine);
    setLastCheckedAt(new Date().toISOString());
    setNextCheckInSeconds(CHECK_INTERVAL_SECONDS);
  }, []);

  useEffect(() => {
    function handleOnline(): void {
      checkNow();
    }

    function handleOffline(): void {
      checkNow();
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkNow]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNextCheckInSeconds((current) => {
        if (current <= 1) {
          window.setTimeout(checkNow, 0);
          return CHECK_INTERVAL_SECONDS;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [checkNow]);

  const progressPercent = useMemo(() => {
    return Math.round(
      ((CHECK_INTERVAL_SECONDS - nextCheckInSeconds) /
        CHECK_INTERVAL_SECONDS) *
        100
    );
  }, [nextCheckInSeconds]);

  return {
    isOnline,
    lastCheckedAt,
    nextCheckInSeconds,
    progressPercent,
    checkNow
  };
}