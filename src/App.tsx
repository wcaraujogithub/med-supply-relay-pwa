// import { useState } from 'react';
// import { API_ENDPOINTS } from './config/api';
// import { DemandFlowModal } from './features/demands/DemandFlowModal';
// import { MatchesModal } from './features/matches/MatchesModal';
// import { OfflineStoragePanel } from './features/storage/OfflineStoragePanel';
// import { SupplyFlowModal } from './features/supplies/SupplyFlowModal';
// import { AppShell } from './shared/components/AppShell';
// import { StatusBadge } from './shared/components/StatusBadge';
// import { useApiHealth } from './shared/hooks/useApiHealth';
// import { useNetworkStatus } from './shared/hooks/useNetworkStatus';
// import { useSyncEngine } from './shared/hooks/useSyncEngine';

// export default function App() {
//   const deviceStatus = useNetworkStatus();
//   const apiHealth = useApiHealth(deviceStatus.isOnline);
//   const syncEngine = useSyncEngine(deviceStatus.isOnline, apiHealth.status);

//   const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
//   const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);
//   const [isMatchesModalOpen, setIsMatchesModalOpen] = useState(false);

//   const apiTone =
//     apiHealth.status === 'online'
//       ? 'success'
//       : apiHealth.status === 'checking'
//         ? 'warning'
//         : 'danger';

//   const syncTone =
//     syncEngine.isSyncing
//       ? 'warning'
//       : !syncEngine.canSync
//         ? 'neutral'
//         : syncEngine.lastResult?.status === 'failed'
//           ? 'danger'
//           : 'success';

//   const allConnectionsOk =
//     deviceStatus.isOnline &&
//     apiHealth.status === 'online' &&
//     syncEngine.canSync &&
//     !syncEngine.isSyncing;

//   async function handleVerifyConnections() {
//     deviceStatus.checkNow();
//     await apiHealth.checkHealth();

//     window.setTimeout(() => {
//       void syncEngine.syncNow('manual-connection-check');
//     }, 300);
//   }

//   return (
//     <AppShell>
//       <section className="hero-panel">
//         <div className="hero-copy">
//           <p className="eyebrow">Emergency MVP</p>

//           <h2>Registrar rápido. Sincronizar quando houver sinal.</h2>

//           <p>
//             Aplicativo PWA offline-first para registrar medicamentos disponíveis
//             e necessidades urgentes em locais de apoio.
//           </p>
//         </div>

//         <div className="status-panel" aria-label="Status do sistema">
//           <div className="status-row">
//             <span>Dispositivo</span>
//             <StatusBadge
//               label={deviceStatus.isOnline ? 'Online' : 'Offline'}
//               tone={deviceStatus.isOnline ? 'success' : 'danger'}
//               nextCheckInSeconds={deviceStatus.nextCheckInSeconds}
//               progressPercent={deviceStatus.progressPercent}
//             />
//           </div>

//           <div className="status-row">
//             <span>API</span>
//             <StatusBadge
//               label={
//                 apiHealth.status === 'checking'
//                   ? 'Verificando'
//                   : apiHealth.status === 'online'
//                     ? 'Disponível'
//                     : 'Indisponível'
//               }
//               tone={apiTone}
//               nextCheckInSeconds={apiHealth.nextCheckInSeconds}
//               progressPercent={apiHealth.progressPercent}
//             />
//           </div>

//           <div className="status-row">
//             <span>Sync</span>
//             <StatusBadge
//               label={
//                 syncEngine.isSyncing
//                   ? 'Sincronizando'
//                   : syncEngine.canSync
//                     ? 'Proximo'
//                     : 'Aguardando'
//               }
//               tone={syncTone}
//               nextCheckInSeconds={syncEngine.nextSyncInSeconds}
//               progressPercent={syncEngine.progressPercent}
//             />
//           </div>

//           <button
//             type="button"
//             className="connection-check-button"
//             disabled={allConnectionsOk || apiHealth.status === 'checking'}
//             onClick={() => void handleVerifyConnections()}
//           >
//             {allConnectionsOk ? 'Conexões OK' : 'Reverificar conexões'}
//           </button>

//           {apiHealth.lastCheckedAt && (
//             <p className="status-note">
//               Última verificação:{' '}
//               {new Date(apiHealth.lastCheckedAt).toLocaleString('pt-BR')}
//             </p>
//           )}
//         </div>
//       </section>

//       <section className="action-grid" aria-label="Ações principais">
//         <button
//           type="button"
//           className="primary-action"
//           onClick={() => setIsSupplyModalOpen(true)}
//         >
//           <span>Tenho remédios</span>
//           <small>Registrar oferta offline</small>
//         </button>

//         <button
//           type="button"
//           className="primary-action primary-action--danger"
//           onClick={() => setIsDemandModalOpen(true)}
//         >
//           <span>Preciso de remédios</span>
//           <small>Registrar demanda urgente</small>
//         </button>

//         <button
//           type="button"
//           className="primary-action primary-action--neutral"
//           onClick={() => setIsMatchesModalOpen(true)}
//         >
//           <span>Ver cruzamentos</span>
//           <small>Oferta x demanda</small>
//         </button>

//         <button
//           type="button"
//           className="primary-action primary-action--neutral"
//           disabled={syncEngine.isSyncing}
//           onClick={() => void syncEngine.syncNow('manual')}
//         >
//           <span>{syncEngine.isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
//           <small>
//             {syncEngine.canSync
//               ? 'Enviar dados pendentes'
//               : 'Aguardando conexão/API'}
//           </small>
//         </button>
//       </section>

//       {syncEngine.lastResult && (
//         <section
//           className={`sync-result-panel sync-result-panel--${syncEngine.lastResult.status}`}
//         >
//           <strong>Última sincronização</strong>
//           <p>{syncEngine.lastResult.message}</p>

//           {syncEngine.lastAttemptAt && (
//             <small>
//               Tentativa:{' '}
//               {new Date(syncEngine.lastAttemptAt).toLocaleString('pt-BR')}
//             </small>
//           )}
//         </section>
//       )}

//       <section className="contingency-panel">
//         <h3>Saídas de contingência</h3>

//         <div className="link-grid">
//           <button
//             type="button"
//             onClick={() => setIsMatchesModalOpen(true)}
//           >
//             Ver cruzamentos
//           </button>

//           <a href={API_ENDPOINTS.exportMatchesTxt} target="_blank" rel="noreferrer">
//             Exportar TXT
//           </a>

//           <a href={API_ENDPOINTS.exportMatchesCsv} target="_blank" rel="noreferrer">
//             Exportar CSV
//           </a>
//         </div>
//       </section>

//       <OfflineStoragePanel />

//       <section className="mvp-note">
//         <h3>Escopo atual</h3>
//         <ul>
//           <li>PWA instalável.</li>
//           <li>Cache offline inicial.</li>
//           <li>Status de rede, API e sync com checagem automática.</li>
//           <li>IndexedDB preparado para armazenamento offline.</li>
//           <li>Fluxo real de oferta salvando offline.</li>
//           <li>Fluxo real de demanda salvando offline.</li>
//           <li>Tela visual de cruzamentos entre oferta e demanda.</li>
//         </ul>
//       </section>

//       <SupplyFlowModal
//         isOpen={isSupplyModalOpen}
//         onClose={() => setIsSupplyModalOpen(false)}
//       />

//       <DemandFlowModal
//         isOpen={isDemandModalOpen}
//         onClose={() => setIsDemandModalOpen(false)}
//       />

//       <MatchesModal
//         isOpen={isMatchesModalOpen}
//         onClose={() => setIsMatchesModalOpen(false)}
//         canLoadFromApi={deviceStatus.isOnline && apiHealth.status === 'online'}
//       />
//     </AppShell>
//   );
// }



import { useState } from 'react';
import { API_ENDPOINTS } from './config/api';
import { DemandFlowModal } from './features/demands/DemandFlowModal';
import { MatchesModal } from './features/matches/MatchesModal';
import { OfflineStoragePanel } from './features/storage/OfflineStoragePanel';
import { SupplyFlowModal } from './features/supplies/SupplyFlowModal';
import { AppShell } from './shared/components/AppShell';
import { OperatorSettingsPanel } from './shared/components/OperatorSettingsPanel';
import { StatusBadge } from './shared/components/StatusBadge';
import { useApiHealth } from './shared/hooks/useApiHealth';
import { useNetworkStatus } from './shared/hooks/useNetworkStatus';
import { useSyncEngine } from './shared/hooks/useSyncEngine';

export default function App() {
  const deviceStatus = useNetworkStatus();
  const apiHealth = useApiHealth(deviceStatus.isOnline);
  const syncEngine = useSyncEngine(deviceStatus.isOnline, apiHealth.status);

  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);
  const [isMatchesModalOpen, setIsMatchesModalOpen] = useState(false);

  const apiTone =
    apiHealth.status === 'online'
      ? 'success'
      : apiHealth.status === 'checking'
        ? 'warning'
        : 'danger';

  const syncTone =
    syncEngine.isSyncing
      ? 'warning'
      : !syncEngine.canSync
        ? 'neutral'
        : syncEngine.lastResult?.status === 'failed'
          ? 'danger'
          : 'success';

  const allConnectionsOk =
    deviceStatus.isOnline &&
    apiHealth.status === 'online' &&
    syncEngine.canSync &&
    !syncEngine.isSyncing;

  async function handleVerifyConnections() {
    deviceStatus.checkNow();
    await apiHealth.checkHealth();

    window.setTimeout(() => {
      void syncEngine.syncNow('manual-connection-check');
    }, 300);
  }

  return (
    <AppShell>
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Emergency MVP</p>

          <h2>Registrar rápido. Sincronizar quando houver sinal.</h2>

          <p>
            Aplicativo PWA offline-first para registrar medicamentos disponíveis
            e necessidades urgentes em locais de apoio.
          </p>
        </div>

        <div className="status-panel" aria-label="Status do sistema">
          <div className="status-row">
            <span>Dispositivo</span>
            <StatusBadge
              label={deviceStatus.isOnline ? 'Online' : 'Offline'}
              tone={deviceStatus.isOnline ? 'success' : 'danger'}
              nextCheckInSeconds={deviceStatus.nextCheckInSeconds}
              progressPercent={deviceStatus.progressPercent}
            />
          </div>

          <div className="status-row">
            <span>API</span>
            <StatusBadge
              label={
                apiHealth.status === 'checking'
                  ? 'Verificando'
                  : apiHealth.status === 'online'
                    ? 'Disponível'
                    : 'Indisponível'
              }
              tone={apiTone}
              nextCheckInSeconds={apiHealth.nextCheckInSeconds}
              progressPercent={apiHealth.progressPercent}
            />
          </div>

          <div className="status-row">
            <span>Sync</span>
            <StatusBadge
              label={
                syncEngine.isSyncing
                  ? 'Sincronizando'
                  : syncEngine.canSync
                    ? 'Pronto'
                    : 'Aguardando'
              }
              tone={syncTone}
              nextCheckInSeconds={syncEngine.nextSyncInSeconds}
              progressPercent={syncEngine.progressPercent}
            />
          </div>

          <button
            type="button"
            className="connection-check-button"
            disabled={allConnectionsOk || apiHealth.status === 'checking'}
            onClick={() => void handleVerifyConnections()}
          >
            {allConnectionsOk ? 'Conexões OK' : 'Reverificar conexões'}
          </button>

          {apiHealth.lastCheckedAt && (
            <p className="status-note">
              Última verificação:{' '}
              {new Date(apiHealth.lastCheckedAt).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
      </section>

      <OperatorSettingsPanel />

      <section className="action-grid" aria-label="Ações principais">
        <button
          type="button"
          className="primary-action"
          onClick={() => setIsSupplyModalOpen(true)}
        >
          <span>Tenho remédios</span>
          <small>Registrar oferta offline</small>
        </button>

        <button
          type="button"
          className="primary-action primary-action--danger"
          onClick={() => setIsDemandModalOpen(true)}
        >
          <span>Preciso de remédios</span>
          <small>Registrar demanda urgente</small>
        </button>

        <button
          type="button"
          className="primary-action primary-action--neutral"
          onClick={() => setIsMatchesModalOpen(true)}
        >
          <span>Ver cruzamentos</span>
          <small>Oferta x demanda</small>
        </button>

        <button
          type="button"
          className="primary-action primary-action--neutral"
          disabled={syncEngine.isSyncing}
          onClick={() => void syncEngine.syncNow('manual')}
        >
          <span>{syncEngine.isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          <small>
            {syncEngine.canSync
              ? 'Enviar dados pendentes'
              : 'Aguardando conexão/API'}
          </small>
        </button>
      </section>

      {syncEngine.lastResult && (
        <section
          className={`sync-result-panel sync-result-panel--${syncEngine.lastResult.status}`}
        >
          <strong>Última sincronização</strong>
          <p>{syncEngine.lastResult.message}</p>

          {syncEngine.lastAttemptAt && (
            <small>
              Tentativa:{' '}
              {new Date(syncEngine.lastAttemptAt).toLocaleString('pt-BR')}
            </small>
          )}
        </section>
      )}

      <section className="contingency-panel">
        <h3>Saídas de contingência</h3>

        <div className="link-grid">
          <button
            type="button"
            onClick={() => setIsMatchesModalOpen(true)}
          >
            Ver cruzamentos
          </button>

          <a href={API_ENDPOINTS.exportMatchesTxt} target="_blank" rel="noreferrer">
            Exportar TXT
          </a>

          <a href={API_ENDPOINTS.exportMatchesCsv} target="_blank" rel="noreferrer">
            Exportar CSV
          </a>
        </div>
      </section>

      <OfflineStoragePanel />

      <section className="mvp-note">
        <h3>Escopo atual</h3>
        <ul>
          <li>PWA instalável.</li>
          <li>Cache offline inicial.</li>
          <li>Status de rede, API e sync com checagem automática.</li>
          <li>Identificação local do operador.</li>
          <li>Contato opcional e localização atual nos registros.</li>
          <li>Fluxo real de oferta e demanda salvando offline.</li>
          <li>Tela visual de cruzamentos entre oferta e demanda.</li>
        </ul>
      </section>

      <SupplyFlowModal
        isOpen={isSupplyModalOpen}
        onClose={() => setIsSupplyModalOpen(false)}
      />

      <DemandFlowModal
        isOpen={isDemandModalOpen}
        onClose={() => setIsDemandModalOpen(false)}
      />

      <MatchesModal
        isOpen={isMatchesModalOpen}
        onClose={() => setIsMatchesModalOpen(false)}
        canLoadFromApi={deviceStatus.isOnline && apiHealth.status === 'online'}
      />
    </AppShell>
  );
}