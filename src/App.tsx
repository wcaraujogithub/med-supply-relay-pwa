import { useState } from 'react';
import { API_ENDPOINTS } from './config/api';
import { DemandFlowModal } from './features/demands/DemandFlowModal';
import { OfflineStoragePanel } from './features/storage/OfflineStoragePanel';
import { SupplyFlowModal } from './features/supplies/SupplyFlowModal';
import { AppShell } from './shared/components/AppShell';
import { StatusBadge } from './shared/components/StatusBadge';
import { useApiHealth } from './shared/hooks/useApiHealth';
import { useNetworkStatus } from './shared/hooks/useNetworkStatus';

export default function App() {
  const isOnline = useNetworkStatus();
  const apiHealth = useApiHealth(isOnline);

  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);

  const apiTone =
    apiHealth.status === 'online'
      ? 'success'
      : apiHealth.status === 'checking'
        ? 'warning'
        : 'danger';

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
              label={isOnline ? 'Online' : 'Offline'}
              tone={isOnline ? 'success' : 'danger'}
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
            />
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => void apiHealth.checkHealth()}
          >
            Verificar conexão
          </button>

          {apiHealth.lastCheckedAt && (
            <p className="status-note">
              Última verificação:{' '}
              {new Date(apiHealth.lastCheckedAt).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
      </section>

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

        <button type="button" className="primary-action primary-action--neutral">
          <span>Ver cruzamentos</span>
          <small>Oferta x demanda</small>
        </button>

        <button type="button" className="primary-action primary-action--neutral">
          <span>Sincronizar</span>
          <small>Enviar dados pendentes</small>
        </button>
      </section>

      <section className="contingency-panel">
        <h3>Saídas de contingência</h3>

        <div className="link-grid">
          <a href={API_ENDPOINTS.matches} target="_blank" rel="noreferrer">
            Ver matches JSON
          </a>

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
          <li>Status de rede e saúde da API.</li>
          <li>IndexedDB preparado para armazenamento offline.</li>
          <li>Fluxo real de oferta salvando offline.</li>
          <li>Fluxo real de demanda salvando offline.</li>
        </ul>

        <p>
          No próximo módulo vamos criar o motor de sincronização automática:
          botão “Sincronizar”, tentativa ao salvar, evento online e tentativa a cada 3 minutos.
        </p>
      </section>

      <SupplyFlowModal
        isOpen={isSupplyModalOpen}
        onClose={() => setIsSupplyModalOpen(false)}
      />

      <DemandFlowModal
        isOpen={isDemandModalOpen}
        onClose={() => setIsDemandModalOpen(false)}
      />
    </AppShell>
  );
}