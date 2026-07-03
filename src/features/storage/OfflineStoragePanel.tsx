// // import { useState } from 'react';
// // import {
// //   createOfflineSyncBatchPayload,
// //   resetLocalDatabase,
// //   seedDemoOfflineData
// // } from '../../db/offlineQueue';
// // import { useOfflineCounts } from '../../shared/hooks/useOfflineCounts';

// // export function OfflineStoragePanel() {
// //   const { counts, isLoading, refresh } = useOfflineCounts();
// //   const [message, setMessage] = useState<string | null>(null);
// //   const [isBusy, setIsBusy] = useState(false);

// //   async function handleSeedDemo() {
// //     setIsBusy(true);
// //     setMessage(null);

// //     try {
// //       await seedDemoOfflineData();
// //       await refresh();
// //       setMessage('Dados demo salvos offline no IndexedDB.');
// //     } catch {
// //       setMessage('Falha ao criar dados demo offline.');
// //     } finally {
// //       setIsBusy(false);
// //     }
// //   }

// //   async function handlePreviewPayload() {
// //     setIsBusy(true);
// //     setMessage(null);

// //     try {
// //       const payload = await createOfflineSyncBatchPayload();

// //       if (!payload) {
// //         setMessage('Nenhum item pendente para sincronizar.');
// //         return;
// //       }

// //       console.log('Offline sync payload:', payload);

// //       setMessage(
// //         `Payload gerado no console: ${payload.locations.length} locais, ${payload.supplies.length} ofertas, ${payload.demands.length} demandas.`
// //       );
// //     } catch {
// //       setMessage('Falha ao gerar payload offline.');
// //     } finally {
// //       setIsBusy(false);
// //     }
// //   }

// //   async function handleReset() {
// //     const confirmed = window.confirm(
// //       'Tem certeza que deseja limpar o banco local offline?'
// //     );

// //     if (!confirmed) {
// //       return;
// //     }

// //     setIsBusy(true);
// //     setMessage(null);

// //     try {
// //       await resetLocalDatabase();
// //       await refresh();
// //       setMessage('Banco local limpo.');
// //     } catch {
// //       setMessage('Falha ao limpar banco local.');
// //     } finally {
// //       setIsBusy(false);
// //     }
// //   }

// //   const pendingTotal =
// //     counts.pendingLocations + counts.pendingSupplies + counts.pendingDemands;

// //   return (
// //     <section className="offline-storage-panel">
// //       <div className="section-title-row">
// //         <div>
// //           <h3>Banco local offline</h3>
// //           <p>IndexedDB preparado para salvar dados mesmo sem internet.</p>
// //         </div>

// //         <span className="offline-pill">
// //           {isLoading ? 'Carregando' : `${pendingTotal} pendente(s)`}
// //         </span>
// //       </div>

// //       <div className="offline-counts-grid">
// //         <div className="offline-count-card">
// //           <strong>{counts.pendingLocations}</strong>
// //           <span>locais pendentes</span>
// //         </div>

// //         <div className="offline-count-card">
// //           <strong>{counts.pendingSupplies}</strong>
// //           <span>ofertas pendentes</span>
// //         </div>

// //         <div className="offline-count-card">
// //           <strong>{counts.pendingDemands}</strong>
// //           <span>demandas pendentes</span>
// //         </div>
// //       </div>

// //       <div className="offline-counts-grid offline-counts-grid--secondary">
// //         <div className="offline-count-card">
// //           <strong>{counts.totalLocations}</strong>
// //           <span>locais no banco</span>
// //         </div>

// //         <div className="offline-count-card">
// //           <strong>{counts.totalSupplies}</strong>
// //           <span>ofertas no banco</span>
// //         </div>

// //         <div className="offline-count-card">
// //           <strong>{counts.totalDemands}</strong>
// //           <span>demandas no banco</span>
// //         </div>
// //       </div>

// //       <div className="storage-actions">
// //         <button
// //           type="button"
// //           className="secondary-button"
// //           disabled={isBusy}
// //           onClick={handleSeedDemo}
// //         >
// //           Criar demo offline
// //         </button>

// //         <button
// //           type="button"
// //           className="secondary-button"
// //           disabled={isBusy}
// //           onClick={handlePreviewPayload}
// //         >
// //           Ver payload no console
// //         </button>

// //         <button
// //           type="button"
// //           className="secondary-button secondary-button--danger"
// //           disabled={isBusy}
// //           onClick={handleReset}
// //         >
// //           Limpar local
// //         </button>
// //       </div>

// //       {message && <p className="storage-message">{message}</p>}
// //     </section>
// //   );
// // }


// import { useState } from 'react';
// import {
//   createOfflineSyncBatchPayload,
//   resetLocalDatabase,
//   seedDemoOfflineData
// } from '../../db/offlineQueue';
// import { useOfflineCounts } from '../../shared/hooks/useOfflineCounts';

// export function OfflineStoragePanel() {
//   const { counts, isLoading, refresh } = useOfflineCounts();
//   const [message, setMessage] = useState<string | null>(null);
//   const [isBusy, setIsBusy] = useState(false);

//   async function handleSeedDemo() {
//     setIsBusy(true);
//     setMessage(null);

//     try {
//       await seedDemoOfflineData();
//       await refresh();
//       setMessage('Dados demo salvos offline no IndexedDB.');
//     } catch {
//       setMessage('Falha ao criar dados demo offline.');
//     } finally {
//       setIsBusy(false);
//     }
//   }

//   async function handlePreviewPayload() {
//     setIsBusy(true);
//     setMessage(null);

//     try {
//       const payload = await createOfflineSyncBatchPayload();

//       if (!payload) {
//         setMessage('Nenhum item pendente para sincronizar.');
//         return;
//       }

//       console.log('Offline sync payload:', payload);

//       setMessage(
//         `Payload gerado no console: ${payload.locations.length} locais, ${payload.supplies.length} ofertas, ${payload.demands.length} demandas.`
//       );
//     } catch {
//       setMessage('Falha ao gerar payload offline.');
//     } finally {
//       setIsBusy(false);
//     }
//   }

//   async function handleReset() {
//     const confirmed = window.confirm(
//       'Tem certeza que deseja limpar o banco local offline?'
//     );

//     if (!confirmed) {
//       return;
//     }

//     setIsBusy(true);
//     setMessage(null);

//     try {
//       await resetLocalDatabase();
//       await refresh();
//       setMessage('Banco local limpo.');
//     } catch {
//       setMessage('Falha ao limpar banco local.');
//     } finally {
//       setIsBusy(false);
//     }
//   }

//   const pendingTotal =
//     counts.pendingLocations + counts.pendingSupplies + counts.pendingDemands;

//   const failedTotal =
//     counts.failedLocations + counts.failedSupplies + counts.failedDemands;

//   const syncingTotal =
//     counts.syncingLocations + counts.syncingSupplies + counts.syncingDemands;

//   return (
//     <section className="offline-storage-panel">
//       <div className="section-title-row">
//         <div>
//           <h3>Banco local offline</h3>
//           <p>IndexedDB preparado para salvar dados mesmo sem internet.</p>
//         </div>

//         <span className="offline-pill">
//           {isLoading
//             ? 'Carregando'
//             : `${pendingTotal} pendente(s)`}
//         </span>
//       </div>

//       <div className="offline-counts-grid">
//         <div className="offline-count-card">
//           <strong>{counts.pendingLocations}</strong>
//           <span>locais pendentes</span>
//         </div>

//         <div className="offline-count-card">
//           <strong>{counts.pendingSupplies}</strong>
//           <span>ofertas pendentes</span>
//         </div>

//         <div className="offline-count-card">
//           <strong>{counts.pendingDemands}</strong>
//           <span>demandas pendentes</span>
//         </div>
//       </div>

//       <div className="offline-counts-grid offline-counts-grid--secondary">
//         <div className="offline-count-card">
//           <strong>{syncingTotal}</strong>
//           <span>sincronizando</span>
//         </div>

//         <div className="offline-count-card">
//           <strong>{failedTotal}</strong>
//           <span>com falha</span>
//         </div>

//         <div className="offline-count-card">
//           <strong>
//             {counts.syncedLocations + counts.syncedSupplies + counts.syncedDemands}
//           </strong>
//           <span>sincronizados</span>
//         </div>
//       </div>

//       <div className="offline-counts-grid offline-counts-grid--secondary">
//         <div className="offline-count-card">
//           <strong>{counts.totalLocations}</strong>
//           <span>locais no banco</span>
//         </div>

//         <div className="offline-count-card">
//           <strong>{counts.totalSupplies}</strong>
//           <span>ofertas no banco</span>
//         </div>

//         <div className="offline-count-card">
//           <strong>{counts.totalDemands}</strong>
//           <span>demandas no banco</span>
//         </div>
//       </div>

//       <div className="storage-actions">
//         <button
//           type="button"
//           className="secondary-button"
//           disabled={isBusy}
//           onClick={handleSeedDemo}
//         >
//           Criar demo offline
//         </button>

//         <button
//           type="button"
//           className="secondary-button"
//           disabled={isBusy}
//           onClick={handlePreviewPayload}
//         >
//           Ver payload no console
//         </button>

//         <button
//           type="button"
//           className="secondary-button secondary-button--danger"
//           disabled={isBusy}
//           onClick={handleReset}
//         >
//           Limpar local
//         </button>
//       </div>

//       {message && <p className="storage-message">{message}</p>}
//     </section>
//   );
// }

// import { useState } from 'react';
// import {
//   createOfflineSyncBatchPayload,
//   resetLocalDatabase,
//   seedDemoOfflineData
// } from '../../db/offlineQueue';
// import { useI18n } from '../../i18n/I18nProvider';
// import { useOfflineCounts } from '../../shared/hooks/useOfflineCounts';

// export function OfflineStoragePanel() {
//   const { t } = useI18n();
//   const { counts, isLoading, refresh } = useOfflineCounts();

//   const [message, setMessage] = useState<string | null>(null);
//   const [isBusy, setIsBusy] = useState(false);

//   async function handleSeedDemo() {
//     setIsBusy(true);
//     setMessage(null);

//     try {
//       await seedDemoOfflineData();
//       await refresh();
//       setMessage(t('storage.demoOk'));
//     } catch {
//       setMessage(t('storage.demoFail'));
//     } finally {
//       setIsBusy(false);
//     }
//   }

//   async function handlePreviewPayload() {
//     setIsBusy(true);
//     setMessage(null);

//     try {
//       const payload = await createOfflineSyncBatchPayload();

//       if (!payload) {
//         setMessage(t('storage.noPending'));
//         return;
//       }

//       console.log('Offline sync payload:', payload);

//       setMessage(
//         t('storage.payloadOk', {
//           locations: payload.locations.length,
//           supplies: payload.supplies.length,
//           demands: payload.demands.length
//         })
//       );
//     } catch {
//       setMessage(t('storage.payloadFail'));
//     } finally {
//       setIsBusy(false);
//     }
//   }

//   async function handleReset() {
//     const confirmed = window.confirm(t('storage.confirmClear'));

//     if (!confirmed) {
//       return;
//     }

//     setIsBusy(true);
//     setMessage(null);

//     try {
//       await resetLocalDatabase();
//       await refresh();
//       setMessage(t('storage.clearOk'));
//     } catch {
//       setMessage(t('storage.clearFail'));
//     } finally {
//       setIsBusy(false);
//     }
//   }

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

//       <div className="storage-actions">
//         <button
//           type="button"
//           className="secondary-button"
//           disabled={isBusy}
//           onClick={handleSeedDemo}
//         >
//           {t('storage.demo')}
//         </button>

//         <button
//           type="button"
//           className="secondary-button"
//           disabled={isBusy}
//           onClick={handlePreviewPayload}
//         >
//           {t('storage.payload')}
//         </button>

//         <button
//           type="button"
//           className="secondary-button secondary-button--danger"
//           disabled={isBusy}
//           onClick={handleReset}
//         >
//           {t('storage.clear')}
//         </button>
//       </div>

//       {message && <p className="storage-message">{message}</p>}
//     </section>
//   );
// }



import { useState } from 'react';
import {
  createOfflineSyncBatchPayload,
  resetLocalDatabase,
  seedDemoOfflineData
} from '../../db/offlineQueue';
import { useI18n } from '../../i18n/I18nProvider';
import { useOfflineCounts } from '../../shared/hooks/useOfflineCounts';

export function OfflineStoragePanel() {
  const { t } = useI18n();
  const { counts, isLoading, refresh } = useOfflineCounts();

  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleSeedDemo() {
    setIsBusy(true);
    setMessage(null);

    try {
      await seedDemoOfflineData();
      await refresh();
      setMessage(t('storage.demoOk'));
    } catch {
      setMessage(t('storage.demoFail'));
    } finally {
      setIsBusy(false);
    }
  }

  async function handlePreviewPayload() {
    setIsBusy(true);
    setMessage(null);

    try {
      const payload = await createOfflineSyncBatchPayload();

      if (!payload) {
        setMessage(t('storage.noPending'));
        return;
      }

      console.log('Offline sync payload:', payload);

      setMessage(
        t('storage.payloadOk', {
          locations: payload.locations.length,
          supplies: payload.supplies.length,
          demands: payload.demands.length
        })
      );
    } catch {
      setMessage(t('storage.payloadFail'));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleReset() {
    const confirmed = window.confirm(t('storage.confirmClear'));

    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setMessage(null);

    try {
      await resetLocalDatabase();
      await refresh();
      setMessage(t('storage.clearOk'));
    } catch {
      setMessage(t('storage.clearFail'));
    } finally {
      setIsBusy(false);
    }
  }

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