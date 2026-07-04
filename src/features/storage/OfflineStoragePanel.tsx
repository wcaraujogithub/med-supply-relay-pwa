/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */
import { useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { useOfflineCounts } from '../../shared/hooks/useOfflineCounts';

export function OfflineStoragePanel() {
  const { t } = useI18n();
  const { counts, isLoading } = useOfflineCounts();

  const [message] = useState<string | null>(null);


  // async function handleSeedDemo() {
  //   setIsBusy(true);
  //   setMessage(null);

  //   try {
  //     await seedDemoOfflineData();
  //     await refresh();
  //     setMessage(t('storage.demoOk'));
  //   } catch {
  //     setMessage(t('storage.demoFail'));
  //   } finally {
  //     setIsBusy(false);
  //   }
  // }

  // async function handlePreviewPayload() {
  //   setIsBusy(true);
  //   setMessage(null);

  //   try {
  //     const payload = await createOfflineSyncBatchPayload();

  //     if (!payload) {
  //       setMessage(t('storage.noPending'));
  //       return;
  //     }

  //     console.log('Offline sync payload:', payload);

  //     setMessage(
  //       t('storage.payloadOk', {
  //         locations: payload.locations.length,
  //         supplies: payload.supplies.length,
  //         demands: payload.demands.length
  //       })
  //     );
  //   } catch {
  //     setMessage(t('storage.payloadFail'));
  //   } finally {
  //     setIsBusy(false);
  //   }
  // }

  // async function handleReset() {
  //   const confirmed = window.confirm(t('storage.confirmClear'));

  //   if (!confirmed) {
  //     return;
  //   }

  //   setIsBusy(true);
  //   setMessage(null);

  //   try {
  //     await resetLocalDatabase();
  //     await refresh();
  //     setMessage(t('storage.clearOk'));
  //   } catch {
  //     setMessage(t('storage.clearFail'));
  //   } finally {
  //     setIsBusy(false);
  //   }
  // }

  const pendingTotal =
    counts.pendingLocations + counts.pendingSupplies + counts.pendingDemands;

  const failedTotal =
    counts.failedLocations + counts.failedSupplies + counts.failedDemands;

  const syncingTotal =
    counts.syncingLocations + counts.syncingSupplies + counts.syncingDemands;

  const syncedTotal =
    counts.syncedLocations + counts.syncedSupplies + counts.syncedDemands;

  return (
    <section className="offline-storage-panel">
      <div className="section-title-row">
        <div>
          <h3>{t('storage.title')}</h3>
          <p>{t('storage.description')}</p>
        </div>

        <span className="offline-pill">
          {isLoading
            ? t('storage.loading')
            : t('storage.pending', { count: pendingTotal })}
        </span>
      </div>

      <div className="offline-counts-grid">
        <div className="offline-count-card">
          <strong>{counts.pendingLocations}</strong>
          <span>{t('storage.pendingLocations')}</span>
        </div>

        <div className="offline-count-card">
          <strong>{counts.pendingSupplies}</strong>
          <span>{t('storage.pendingSupplies')}</span>
        </div>

        <div className="offline-count-card">
          <strong>{counts.pendingDemands}</strong>
          <span>{t('storage.pendingDemands')}</span>
        </div>
      </div>

      <div className="offline-counts-grid offline-counts-grid--secondary">
        <div className="offline-count-card">
          <strong>{syncingTotal}</strong>
          <span>{t('storage.syncing')}</span>
        </div>

        <div className="offline-count-card">
          <strong>{failedTotal}</strong>
          <span>{t('storage.failed')}</span>
        </div>

        <div className="offline-count-card">
          <strong>{syncedTotal}</strong>
          <span>{t('storage.synced')}</span>
        </div>
      </div>

      <div className="offline-counts-grid offline-counts-grid--secondary">
        <div className="offline-count-card">
          <strong>{counts.totalLocations}</strong>
          <span>{t('storage.totalLocations')}</span>
        </div>

        <div className="offline-count-card">
          <strong>{counts.totalSupplies}</strong>
          <span>{t('storage.totalSupplies')}</span>
        </div>

        <div className="offline-count-card">
          <strong>{counts.totalDemands}</strong>
          <span>{t('storage.totalDemands')}</span>
        </div>
      </div>

      {/* <div className="storage-actions">
        <button
          type="button"
          className="secondary-button"
          disabled={isBusy}
          onClick={handleSeedDemo}
        >
          {t('storage.demo')}
        </button>

        <button
          type="button"
          className="secondary-button"
          disabled={isBusy}
          onClick={handlePreviewPayload}
        >
          {t('storage.payload')}
        </button>

        <button
          type="button"
          className="secondary-button secondary-button--danger"
          disabled={isBusy}
          onClick={handleReset}
        >
          {t('storage.clear')}
        </button>
      </div> */}

      {message && <p className="storage-message">{message}</p>}
    </section>
  );
}


// export function OfflineStoragePanel() {
//   const { t } = useI18n();
//   const { counts, isLoading } = useOfflineCounts();

//   const pendingTotal =
//     counts.pendingLocations + counts.pendingSupplies + counts.pendingDemands;

//   const failedTotal =
//     counts.failedLocations + counts.failedSupplies + counts.failedDemands;

//   const syncingTotal =
//     counts.syncingLocations + counts.syncingSupplies + counts.syncingDemands;

//   const syncedTotal =
//     counts.syncedLocations + counts.syncedSupplies + counts.syncedDemands;

//   return (
//     <section className="offline-storage-panel">
//       <div className="section-title-row">
//         <div>
//           <h3>{t('storage.title')}</h3>
//           <p>{t('storage.description')}</p>
//         </div>

//         <span className="offline-pill">
//           {isLoading
//             ? t('storage.loading')
//             : t('storage.pending', { count: pendingTotal })}
//         </span>
//       </div>

//       <div className="offline-counts-grid">
//         <div className="offline-count-card">
//           <strong>{counts.pendingLocations}</strong>
//           <span>{t('storage.pendingLocations')}</span>
//         </div>

//         <div className="offline-count-card">
//           <strong>{counts.pendingSupplies}</strong>
//           <span>{t('storage.pendingSupplies')}</span>
//         </div>

//         <div className="offline-count-card">
//           <strong>{counts.pendingDemands}</strong>
//           <span>{t('storage.pendingDemands')}</span>
//         </div>
//       </div>

//       <div className="offline-counts-grid offline-counts-grid--secondary">
//         <div className="offline-count-card">
//           <strong>{syncingTotal}</strong>
//           <span>{t('storage.syncing')}</span>
//         </div>

//         <div className="offline-count-card">
//           <strong>{failedTotal}</strong>
//           <span>{t('storage.failed')}</span>
//         </div>

//         <div className="offline-count-card">
//           <strong>{syncedTotal}</strong>
//           <span>{t('storage.synced')}</span>
//         </div>
//       </div>

//       <div className="offline-counts-grid offline-counts-grid--secondary">
//         <div className="offline-count-card">
//           <strong>{counts.totalLocations}</strong>
//           <span>{t('storage.totalLocations')}</span>
//         </div>

//         <div className="offline-count-card">
//           <strong>{counts.totalSupplies}</strong>
//           <span>{t('storage.totalSupplies')}</span>
//         </div>

//         <div className="offline-count-card">
//           <strong>{counts.totalDemands}</strong>
//           <span>{t('storage.totalDemands')}</span>
//         </div>
//       </div>
//     </section>
//   );
// }