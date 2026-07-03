import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { ActiveReservationsPanel } from '../reservations/ActiveReservationsPanel';
import { ReservationCreateModal } from '../reservations/ReservationCreateModal';
import {
  changeReservationStatus,
  expireOldReservations,
  fetchActiveReservations,
  fetchFinalizedReservations
} from '../reservations/reservationsApi';
import type {
  ReservationAction,
  ReservationResponse,
  ReservationStatus
} from '../reservations/reservationTypes';
import { fetchMatches } from '../matches/matchesApi';
import type { MatchFilters, MatchPriority, MatchResultDto } from '../matches/matchesTypes';

type OperationsTab = 'matches' | 'reservations' | 'history' | 'exports';

type OperationsPageProps = {
  canUseApi: boolean;
  onBack: () => void;
};

function priorityLabel(priority: MatchPriority): string {
  switch (priority) {
    case 'Critical':
      return 'Crítica';
    case 'High':
      return 'Alta';
    case 'Medium':
      return 'Média';
    case 'Low':
      return 'Baixa';
    default:
      return String(priority);
  }
}

function priorityTone(priority: MatchPriority): string {
  switch (priority) {
    case 'Critical':
      return 'critical';
    case 'High':
      return 'high';
    case 'Medium':
      return 'medium';
    case 'Low':
      return 'low';
    default:
      return 'medium';
  }
}

function formatQuantity(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 3
  }).format(value);
}

function safe(value?: string | null): string {
  return value && value.trim().length > 0 ? value.trim() : '-';
}

function getScoreTone(score: number): string {
  if (score >= 85) {
    return 'excellent';
  }

  if (score >= 70) {
    return 'good';
  }

  if (score >= 50) {
    return 'medium';
  }

  return 'low';
}

function getAvailableQuantity(match: MatchResultDto): number {
  return match.supplyAvailableQuantity ?? match.supplyQuantity ?? 0;
}

function getReservedQuantity(match: MatchResultDto): number {
  return match.supplyReservedQuantity ?? 0;
}

function getTotalQuantity(match: MatchResultDto): number {
  return match.supplyTotalQuantity ?? match.supplyQuantity ?? 0;
}

function buildExportUrl(baseUrl: string, filters: MatchFilters): string {
  const url = new URL(baseUrl);

  if (filters.medicineName?.trim()) {
    url.searchParams.set('medicineName', filters.medicineName.trim());
  }

  if (filters.area?.trim()) {
    url.searchParams.set('area', filters.area.trim());
  }

  if (filters.criticalOnly) {
    url.searchParams.set('criticalOnly', 'true');
  }

  url.searchParams.set('limit', String(filters.limit ?? 100));

  return url.toString();
}

function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function OperationsPage({ canUseApi, onBack }: OperationsPageProps) {
  const [activeTab, setActiveTab] = useState<OperationsTab>('matches');

  const [medicineName, setMedicineName] = useState('');
  const [area, setArea] = useState('');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [limit, setLimit] = useState(100);

  const [items, setItems] = useState<MatchResultDto[]>([]);
  const [activeReservations, setActiveReservations] = useState<ReservationResponse[]>([]);
  const [finalizedReservations, setFinalizedReservations] = useState<ReservationResponse[]>([]);

  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [reservationsError, setReservationsError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);

  const [selectedMatch, setSelectedMatch] = useState<MatchResultDto | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filters = useMemo<MatchFilters>(
    () => ({
      medicineName,
      area,
      criticalOnly,
      limit
    }),
    [area, criticalOnly, limit, medicineName]
  );

  const recommendedCount = useMemo(
    () => items.filter((item) => item.recommended === true).length,
    [items]
  );

  const criticalCount = useMemo(
    () => items.filter((item) => item.priority === 'Critical').length,
    [items]
  );

  const totalSuggested = useMemo(
    () => items.reduce((total, item) => total + Number(item.suggestedQuantity || 0), 0),
    [items]
  );

  const totalPages = useMemo(
    () => getTotalPages(items.length, pageSize),
    [items.length, pageSize]
  );

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items, pageSize]);

  const loadMatches = useCallback(
    async (overrideFilters?: MatchFilters) => {
      if (!canUseApi) {
        setMatchesError(
          'Não foi possível carregar cruzamentos agora: dispositivo offline ou API indisponível.'
        );
        return;
      }

      setIsLoadingMatches(true);
      setMatchesError(null);

      try {
        const result = await fetchMatches(overrideFilters ?? filters);
        setItems(result);
        setCurrentPage(1);
      } catch (currentError) {
        const message =
          currentError instanceof Error
            ? currentError.message
            : 'Falha ao carregar cruzamentos.';

        setMatchesError(message);
      } finally {
        setIsLoadingMatches(false);
      }
    },
    [canUseApi, filters]
  );

  const loadActiveReservations = useCallback(async () => {
    if (!canUseApi) {
      setActiveReservations([]);
      setReservationsError(null);
      return;
    }

    setIsLoadingReservations(true);
    setReservationsError(null);

    try {
      const result = await fetchActiveReservations();
      setActiveReservations(result);
    } catch (currentError) {
      const message =
        currentError instanceof Error
          ? currentError.message
          : 'Falha ao carregar reservas ativas.';

      setReservationsError(message);
    } finally {
      setIsLoadingReservations(false);
    }
  }, [canUseApi]);

  const loadFinalizedReservations = useCallback(async () => {
    if (!canUseApi) {
      setFinalizedReservations([]);
      setHistoryError(null);
      return;
    }

    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const result = await fetchFinalizedReservations();
      setFinalizedReservations(result);
    } catch (currentError) {
      const message =
        currentError instanceof Error
          ? currentError.message
          : 'Falha ao carregar histórico.';

      setHistoryError(message);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [canUseApi]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadMatches(),
      loadActiveReservations(),
      loadFinalizedReservations()
    ]);
  }, [loadActiveReservations, loadFinalizedReservations, loadMatches]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  async function handleApplyFilters() {
    await loadMatches();
  }

  async function handleClearFilters() {
    const cleanFilters: MatchFilters = {
      medicineName: '',
      area: '',
      criticalOnly: false,
      limit: 100
    };

    setMedicineName('');
    setArea('');
    setCriticalOnly(false);
    setLimit(100);
    setMatchesError(null);

    await loadMatches(cleanFilters);
  }

  async function handleReservationCreated() {
    setSelectedMatch(null);
    setOperationMessage('Reserva criada. Estoque livre atualizado.');
    await refreshAll();
  }

  async function handleChangeReservationStatus(
    reservation: ReservationResponse,
    action: ReservationAction
  ) {
    const note = window.prompt('Observação opcional:', '');

    setOperationMessage(null);
    setReservationsError(null);

    try {
      await changeReservationStatus(reservation.id, action, note);
      setOperationMessage('Status da reserva atualizado.');
      await refreshAll();
    } catch (currentError) {
      const message =
        currentError instanceof Error
          ? currentError.message
          : 'Não foi possível atualizar a reserva.';

      setReservationsError(message);
    }
  }
function statusTone(status: ReservationStatus): string {
  switch (status) {
    case 'Pending':
      return 'pending';
    case 'Confirmed':
      return 'confirmed';
    case 'InTransit':
      return 'transit';
    case 'Delivered':
      return 'delivered';
    case 'Cancelled':
      return 'cancelled';
    case 'Expired':
      return 'expired';
    default:
      return 'pending';
  }
}
function statusLabel(status: ReservationStatus): string {
  switch (status) {
    case 'Pending':
      return 'Pendente';
    case 'Confirmed':
      return 'Confirmada';
    case 'InTransit':
      return 'Em trânsito';
    case 'Delivered':
      return 'Entregue';
    case 'Cancelled':
      return 'Cancelada';
    case 'Expired':
      return 'Expirada';
    default:
      return String(status);
  }
}
  async function handleExpireOldReservations() {
    setOperationMessage(null);
    setReservationsError(null);

    try {
      const result = await expireOldReservations();

      setOperationMessage(
        result.expiredCount === 0
          ? 'Nenhuma reserva vencida para expirar.'
          : `${result.expiredCount} reserva(s) vencida(s) expirada(s).`
      );

      await refreshAll();
    } catch (currentError) {
      const message =
        currentError instanceof Error
          ? currentError.message
          : 'Não foi possível expirar reservas vencidas.';

      setReservationsError(message);
    }
  }

  return (
    <main className="operations-page">
      <header className="operations-hero">
        <div>
          <p className="eyebrow">Operação</p>
          <h2>Oferta x demanda</h2>
          <p>
            Página operacional para analisar cruzamentos, reservar retirada e
            acompanhar o fluxo das reservas sem sobrecarregar a tela inicial.
          </p>
        </div>

        <button type="button" className="secondary-button" onClick={onBack}>
          Voltar para início
        </button>
      </header>

      <nav className="operations-tabs" aria-label="Navegação operacional">
        <button
          type="button"
          className={activeTab === 'matches' ? 'active' : ''}
          onClick={() => setActiveTab('matches')}
        >
          Cruzamentos
        </button>

        <button
          type="button"
          className={activeTab === 'reservations' ? 'active' : ''}
          onClick={() => setActiveTab('reservations')}
        >
          Reservas ativas
        </button>

        <button
          type="button"
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          Histórico
        </button>

        <button
          type="button"
          className={activeTab === 'exports' ? 'active' : ''}
          onClick={() => setActiveTab('exports')}
        >
          Exportações
        </button>
      </nav>

      {operationMessage && (
        <p className="form-message form-message--success">
          {operationMessage}
        </p>
      )}

      {activeTab === 'matches' && (
        <>
          <section className="operations-filters-panel">
            <div className="operations-filters">
              <label>
                <span>Medicamento</span>
                <input
                  value={medicineName}
                  onChange={(event) => setMedicineName(event.target.value)}
                  placeholder="Ex.: Paracetamol"
                />
              </label>

              <label>
                <span>Área</span>
                <input
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  placeholder="Ex.: Caracas"
                />
              </label>

              <label>
                <span>Limite da API</span>
                <select
                  value={limit}
                  onChange={(event) => setLimit(Number(event.target.value))}
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </label>

              <label>
                <span>Itens por página</span>
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={criticalOnly}
                  onChange={(event) => setCriticalOnly(event.target.checked)}
                />
                <span>Apenas críticas</span>
              </label>
            </div>

            <div className="operations-filter-actions">
              <button
                type="button"
                className="submit-button"
                disabled={!canUseApi || isLoadingMatches}
                onClick={() => void handleApplyFilters()}
              >
                {isLoadingMatches ? 'Carregando...' : 'Atualizar cruzamentos'}
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={isLoadingMatches}
                onClick={() => void handleClearFilters()}
              >
                Limpar filtros
              </button>
            </div>
          </section>

          <section className="operations-summary-grid">
            <div>
              <strong>{items.length}</strong>
              <span>cruzamento(s)</span>
            </div>

            <div>
              <strong>{recommendedCount}</strong>
              <span>melhores opções</span>
            </div>

            <div>
              <strong>{activeReservations.length}</strong>
              <span>reservas ativas</span>
            </div>

            <div>
              <strong>{criticalCount}</strong>
              <span>críticos</span>
            </div>

            <div>
              <strong>{formatQuantity(totalSuggested)}</strong>
              <span>qtd. sugerida total</span>
            </div>
          </section>

          {matchesError && (
            <p className="form-message form-message--error">{matchesError}</p>
          )}

          {!matchesError && items.length === 0 && !isLoadingMatches && (
            <section className="empty-state">
              <strong>Nenhum cruzamento encontrado.</strong>
              <p>
                Pode não haver oferta compatível, estoque livre suficiente, ou os
                dados offline ainda não foram sincronizados com a API.
              </p>
            </section>
          )}

          <div className="operations-list-header">
            <span>
              Página {currentPage} de {totalPages}
            </span>

            <div className="operations-pagination">
              <button
                type="button"
                className="secondary-button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Anterior
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
              >
                Próxima
              </button>
            </div>
          </div>

          <div className="matches-list operations-matches-list">
            {paginatedItems.map((match) => {
              const score = match.viabilityScore ?? 0;
              const reasons = match.recommendationReasons ?? [];
              const availableQuantity = getAvailableQuantity(match);
              const reservedQuantity = getReservedQuantity(match);
              const totalQuantity = getTotalQuantity(match);

              return (
                <article
                  className={`match-card ${
                    match.recommended ? 'match-card--recommended' : ''
                  }`}
                  key={`${match.demandId}-${match.supplyId}`}
                >
                  <div className="match-card__top">
                    <div className="match-badges-left">
                      {match.recommended && (
                        <span className="recommended-badge">
                          ⭐ Melhor opção sugerida
                        </span>
                      )}

                      <span
                        className={`priority-badge priority-badge--${priorityTone(
                          match.priority
                        )}`}
                      >
                        {priorityLabel(match.priority)}
                      </span>
                    </div>

                    <div className="match-badges-right">
                      <span
                        className={`score-pill score-pill--${getScoreTone(score)}`}
                      >
                        Score {score}/100
                      </span>

                      {typeof match.distanceKm === 'number' && (
                        <span className="distance-pill">
                          {match.distanceKm.toFixed(2)} km
                        </span>
                      )}
                    </div>
                  </div>

                  <h3>{match.medicineName}</h3>

                  <div className="match-route">
                    <div className="match-route__box match-route__box--demand">
                      <span>Precisa</span>
                      <strong>{safe(match.demandLocationName)}</strong>
                      <small>{safe(match.demandLocationArea)}</small>
                    </div>

                    <div className="match-route__arrow">→</div>

                    <div className="match-route__box match-route__box--supply">
                      <span>Tem disponível</span>
                      <strong>{safe(match.supplyLocationName)}</strong>
                      <small>{safe(match.supplyLocationArea)}</small>
                    </div>
                  </div>

                  <div className="match-quantity-grid match-quantity-grid--reservation">
                    <div>
                      <span>Necessário</span>
                      <strong>
                        {formatQuantity(match.demandQuantity)} {match.unit}
                      </strong>
                    </div>

                    <div>
                      <span>Total oferta</span>
                      <strong>
                        {formatQuantity(totalQuantity)} {match.unit}
                      </strong>
                    </div>

                    <div>
                      <span>Reservado</span>
                      <strong>
                        {formatQuantity(reservedQuantity)} {match.unit}
                      </strong>
                    </div>

                    <div>
                      <span>Livre agora</span>
                      <strong>
                        {formatQuantity(availableQuantity)} {match.unit}
                      </strong>
                    </div>

                    <div>
                      <span>Sugestão</span>
                      <strong>
                        {formatQuantity(match.suggestedQuantity)} {match.unit}
                      </strong>
                    </div>
                  </div>

                  {match.supplyExpiresOn && (
                    <p className="match-note">
                      Validade da oferta: {match.supplyExpiresOn}
                    </p>
                  )}

                  {reasons.length > 0 && (
                    <section className="recommendation-reasons">
                      <strong>Por que essa opção?</strong>

                      <ul>
                        {reasons.slice(0, 5).map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <div className="match-reservation-actions">
                    <button
                      type="button"
                      className="reservation-main-button"
                      disabled={!canUseApi || availableQuantity <= 0}
                      onClick={() => setSelectedMatch(match)}
                    >
                      {availableQuantity > 0
                        ? 'Reservar retirada'
                        : 'Sem estoque livre'}
                    </button>

                    {!canUseApi && (
                      <span>
                        Reserva indisponível offline. Sincronize quando houver
                        sinal.
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'reservations' && (
        <ActiveReservationsPanel
          activeReservations={activeReservations}
          finalizedReservations={[]}
          isLoading={isLoadingReservations}
          isHistoryLoading={false}
          error={reservationsError}
          historyError={null}
          canUseApi={canUseApi}
          onRefresh={loadActiveReservations}
          onRefreshHistory={loadFinalizedReservations}
          onExpireOld={handleExpireOldReservations}
          onChangeStatus={handleChangeReservationStatus}
        />
      )}

      {activeTab === 'history' && (
        <section className="operations-history-panel">
          <div className="active-reservations-header">
            <div>
              <h3>Histórico de reservas</h3>
              <p>Reservas entregues, canceladas ou expiradas.</p>
            </div>

            <button
              type="button"
              className="submit-button"
              disabled={!canUseApi || isLoadingHistory}
              onClick={() => void loadFinalizedReservations()}
            >
              {isLoadingHistory ? 'Carregando...' : 'Atualizar histórico'}
            </button>
          </div>

          {historyError && (
            <p className="form-message form-message--error">{historyError}</p>
          )}

          {finalizedReservations.length === 0 && !isLoadingHistory && (
            <section className="empty-state">
              <strong>Nenhum histórico carregado.</strong>
              <p>Reservas finalizadas aparecerão aqui.</p>
            </section>
          )}

          <div className="reservation-history-list">
            {finalizedReservations.map((reservation) => (
              <article className="reservation-history-item" key={reservation.id}>
            <span
                className={`reservation-status reservation-status--${statusTone(
                  reservation.status
                )}`}
              >   {statusLabel(reservation.status)}</span>
                <span>{reservation.medicineName}</span>
                <span>
                  {formatQuantity(reservation.reservedQuantity)} {reservation.unit}
                </span>
                <small>
                  {reservation.demandLocationName ?? '-'} ←{' '}
                  {reservation.supplyLocationName ?? '-'}
                </small>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'exports' && (
        <section className="operations-export-panel">
          <h3>Exportações de contingência</h3>

          <p>
            Use TXT quando precisar compartilhar por mensagem simples. Use CSV
            quando precisar abrir em planilha.
          </p>

          <div className="matches-export-row">
            <a
              href={buildExportUrl(API_ENDPOINTS.exportMatchesTxt, filters)}
              target="_blank"
              rel="noreferrer"
            >
              Exportar TXT com filtros atuais
            </a>

            <a
              href={buildExportUrl(API_ENDPOINTS.exportMatchesCsv, filters)}
              target="_blank"
              rel="noreferrer"
            >
              Exportar CSV com filtros atuais
            </a>
          </div>

          <section className="mvp-note operations-export-note">
            <h3>Os exports consideram reservas ativas</h3>
            <ul>
              <li>Ofertas totalmente reservadas não aparecem como livres.</li>
              <li>TXT/CSV mostram total da oferta, reservado ativo e livre agora.</li>
              <li>Filtros de medicamento, área, prioridade crítica e limite são enviados na URL.</li>
            </ul>
          </section>
        </section>
      )}

      <ReservationCreateModal
        isOpen={selectedMatch !== null}
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onCreated={handleReservationCreated}
      />
    </main>
  );
}