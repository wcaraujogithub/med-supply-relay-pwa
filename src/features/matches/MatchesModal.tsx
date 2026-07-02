// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { API_ENDPOINTS } from '../../config/api';
// import { fetchMatches } from './matchesApi';
// import type { MatchFilters, MatchPriority, MatchResultDto } from './matchesTypes';

// type MatchesModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   canLoadFromApi: boolean;
// };

// function priorityLabel(priority: MatchPriority): string {
//   switch (priority) {
//     case 'Critical':
//       return 'Crítica';
//     case 'High':
//       return 'Alta';
//     case 'Medium':
//       return 'Média';
//     case 'Low':
//       return 'Baixa';
//     default:
//       return String(priority);
//   }
// }

// function priorityTone(priority: MatchPriority): string {
//   switch (priority) {
//     case 'Critical':
//       return 'critical';
//     case 'High':
//       return 'high';
//     case 'Medium':
//       return 'medium';
//     case 'Low':
//       return 'low';
//     default:
//       return 'medium';
//   }
// }

// function formatQuantity(value: number): string {
//   return new Intl.NumberFormat('pt-BR', {
//     maximumFractionDigits: 3
//   }).format(value);
// }

// function safe(value?: string | null): string {
//   return value && value.trim().length > 0 ? value.trim() : '-';
// }

// function buildExportUrl(baseUrl: string, filters: MatchFilters): string {
//   const url = new URL(baseUrl);

//   if (filters.medicineName?.trim()) {
//     url.searchParams.set('medicineName', filters.medicineName.trim());
//   }

//   if (filters.area?.trim()) {
//     url.searchParams.set('area', filters.area.trim());
//   }

//   if (filters.criticalOnly) {
//     url.searchParams.set('criticalOnly', 'true');
//   }

//   url.searchParams.set('limit', String(filters.limit ?? 50));

//   return url.toString();
// }

// function getScoreTone(score: number): string {
//   if (score >= 85) {
//     return 'excellent';
//   }

//   if (score >= 70) {
//     return 'good';
//   }

//   if (score >= 50) {
//     return 'medium';
//   }

//   return 'low';
// }

// export function MatchesModal({
//   isOpen,
//   onClose,
//   canLoadFromApi
// }: MatchesModalProps) {
//   const [medicineName, setMedicineName] = useState('');
//   const [area, setArea] = useState('');
//   const [criticalOnly, setCriticalOnly] = useState(false);
//   const [limit, setLimit] = useState(50);

//   const [items, setItems] = useState<MatchResultDto[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const filters = useMemo<MatchFilters>(
//     () => ({
//       medicineName,
//       area,
//       criticalOnly,
//       limit
//     }),
//     [area, criticalOnly, limit, medicineName]
//   );

//   const criticalCount = useMemo(
//     () => items.filter((item) => item.priority === 'Critical').length,
//     [items]
//   );

//   const recommendedCount = useMemo(
//     () => items.filter((item) => item.recommended === true).length,
//     [items]
//   );

//   const totalSuggested = useMemo(
//     () =>
//       items.reduce((total, item) => {
//         return total + Number(item.suggestedQuantity || 0);
//       }, 0),
//     [items]
//   );

//   const loadMatches = useCallback(async () => {
//     if (!canLoadFromApi) {
//       setError(
//         'Não foi possível carregar cruzamentos agora: dispositivo offline ou API indisponível.'
//       );
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       const result = await fetchMatches(filters);
//       setItems(result);
//     } catch (currentError) {
//       const message =
//         currentError instanceof Error
//           ? currentError.message
//           : 'Falha ao carregar cruzamentos.';

//       setError(message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [canLoadFromApi, filters]);

//   function resetFilters(): void {
//     setMedicineName('');
//     setArea('');
//     setCriticalOnly(false);
//     setLimit(50);
//   }

//   function handleClose(): void {
//     resetFilters();
//     setItems([]);
//     setError(null);
//     setIsLoading(false);
//     onClose();
//   }

//   function handleClearFilters(): void {
//     resetFilters();
//     setError(null);

//     window.setTimeout(() => {
//       void loadMatches();
//     }, 0);
//   }

//   useEffect(() => {
//     if (!isOpen) {
//       return;
//     }

//     void loadMatches();
//   }, [isOpen, loadMatches]);

//   if (!isOpen) {
//     return null;
//   }

//   return (
//     <div className="modal-backdrop" role="presentation">
//       <section
//         className="modal-card matches-modal"
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="matches-modal-title"
//       >
//         <header className="modal-header modal-header--matches">
//           <div>
//             <p className="eyebrow">Cruzamentos</p>
//             <h2 id="matches-modal-title">Oferta x demanda</h2>
//             <p>
//               Veja quais locais possuem medicamentos compatíveis com necessidades
//               abertas. A lista destaca a melhor opção sugerida para cada demanda.
//             </p>
//           </div>

//           <button
//             type="button"
//             className="icon-button"
//             aria-label="Fechar"
//             onClick={handleClose}
//           >
//             ×
//           </button>
//         </header>

//         <div className="matches-content">
//           <section className="matches-filters">
//             <label>
//               <span>Medicamento</span>
//               <input
//                 value={medicineName}
//                 onChange={(event) => setMedicineName(event.target.value)}
//                 placeholder="Ex.: Paracetamol"
//               />
//             </label>

//             <label>
//               <span>Área</span>
//               <input
//                 value={area}
//                 onChange={(event) => setArea(event.target.value)}
//                 placeholder="Ex.: Caracas"
//               />
//             </label>

//             <label>
//               <span>Limite</span>
//               <select
//                 value={limit}
//                 onChange={(event) => setLimit(Number(event.target.value))}
//               >
//                 <option value={20}>20</option>
//                 <option value={50}>50</option>
//                 <option value={100}>100</option>
//                 <option value={200}>200</option>
//               </select>
//             </label>

//             <label className="checkbox-label">
//               <input
//                 type="checkbox"
//                 checked={criticalOnly}
//                 onChange={(event) => setCriticalOnly(event.target.checked)}
//               />
//               <span>Apenas críticas</span>
//             </label>

//             <button
//               type="button"
//               className="submit-button"
//               disabled={isLoading || !canLoadFromApi}
//               onClick={() => void loadMatches()}
//             >
//               {isLoading ? 'Carregando...' : 'Atualizar lista'}
//             </button>
//           </section>

//           <div className="matches-secondary-actions">
//             <button
//               type="button"
//               className="secondary-button"
//               onClick={handleClearFilters}
//               disabled={isLoading}
//             >
//               Limpar filtros
//             </button>
//           </div>

//           <section className="matches-summary">
//             <div>
//               <strong>{items.length}</strong>
//               <span>cruzamento(s)</span>
//             </div>

//             <div>
//               <strong>{recommendedCount}</strong>
//               <span>melhor(es) opção(ões)</span>
//             </div>

//             <div>
//               <strong>{criticalCount}</strong>
//               <span>crítico(s)</span>
//             </div>

//             <div>
//               <strong>{formatQuantity(totalSuggested)}</strong>
//               <span>qtd. sugerida total</span>
//             </div>
//           </section>

//           <section className="matches-export-row">
//             <a
//               href={buildExportUrl(API_ENDPOINTS.exportMatchesTxt, filters)}
//               target="_blank"
//               rel="noreferrer"
//             >
//               Exportar TXT
//             </a>

//             <a
//               href={buildExportUrl(API_ENDPOINTS.exportMatchesCsv, filters)}
//               target="_blank"
//               rel="noreferrer"
//             >
//               Exportar CSV
//             </a>
//           </section>

//           {error && <p className="form-message form-message--error">{error}</p>}

//           {!error && items.length === 0 && !isLoading && (
//             <section className="empty-state">
//               <strong>Nenhum cruzamento encontrado.</strong>
//               <p>
//                 Pode não haver oferta compatível, ou os dados offline ainda não
//                 foram sincronizados com a API.
//               </p>
//             </section>
//           )}

//           <div className="matches-list">
//             {items.map((match) => {
//               const score = match.viabilityScore ?? 0;
//               const reasons = match.recommendationReasons ?? [];

//               return (
//                 <article
//                   className={`match-card ${
//                     match.recommended ? 'match-card--recommended' : ''
//                   }`}
//                   key={`${match.demandId}-${match.supplyId}`}
//                 >
//                   <div className="match-card__top">
//                     <div className="match-badges-left">
//                       {match.recommended && (
//                         <span className="recommended-badge">
//                           ⭐ Melhor opção sugerida
//                         </span>
//                       )}

//                       <span
//                         className={`priority-badge priority-badge--${priorityTone(
//                           match.priority
//                         )}`}
//                       >
//                         {priorityLabel(match.priority)}
//                       </span>
//                     </div>

//                     <div className="match-badges-right">
//                       <span
//                         className={`score-pill score-pill--${getScoreTone(score)}`}
//                       >
//                         Score {score}/100
//                       </span>

//                       {typeof match.distanceKm === 'number' && (
//                         <span className="distance-pill">
//                           {match.distanceKm.toFixed(2)} km
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   <h3>{match.medicineName}</h3>

//                   <div className="match-quantity-grid">
//                     <div>
//                       <span>Necessário</span>
//                       <strong>
//                         {formatQuantity(match.demandQuantity)} {match.unit}
//                       </strong>
//                     </div>

//                     <div>
//                       <span>Disponível</span>
//                       <strong>
//                         {formatQuantity(match.supplyQuantity)} {match.unit}
//                       </strong>
//                     </div>

//                     <div>
//                       <span>Sugestão</span>
//                       <strong>
//                         {formatQuantity(match.suggestedQuantity)} {match.unit}
//                       </strong>
//                     </div>
//                   </div>

//                   <div className="match-route">
//                     <div className="match-route__box match-route__box--demand">
//                       <span>Precisa</span>
//                       <strong>{safe(match.demandLocationName)}</strong>
//                       <small>{safe(match.demandLocationArea)}</small>
//                     </div>

//                     <div className="match-route__arrow">→</div>

//                     <div className="match-route__box match-route__box--supply">
//                       <span>Tem disponível</span>
//                       <strong>{safe(match.supplyLocationName)}</strong>
//                       <small>{safe(match.supplyLocationArea)}</small>
//                     </div>
//                   </div>

//                   {match.supplyExpiresOn && (
//                     <p className="match-note">
//                       Validade da oferta: {match.supplyExpiresOn}
//                     </p>
//                   )}

//                   {reasons.length > 0 && (
//                     <section className="recommendation-reasons">
//                       <strong>Por que essa opção?</strong>

//                       <ul>
//                         {reasons.slice(0, 5).map((reason) => (
//                           <li key={reason}>{reason}</li>
//                         ))}
//                       </ul>
//                     </section>
//                   )}

//                   <p className="match-action">
//                     Ação sugerida: coordenação validar disponibilidade real,
//                     transporte e prioridade clínica.
//                   </p>
//                 </article>
//               );
//             })}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }


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
  ReservationResponse
} from '../reservations/reservationTypes';
import { fetchMatches } from './matchesApi';
import type { MatchFilters, MatchPriority, MatchResultDto } from './matchesTypes';

type MatchesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  canLoadFromApi: boolean;
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

  url.searchParams.set('limit', String(filters.limit ?? 50));

  return url.toString();
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



export function MatchesModal({
  isOpen,
  onClose,
  canLoadFromApi
}: MatchesModalProps) {
  const [medicineName, setMedicineName] = useState('');
  const [area, setArea] = useState('');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [limit, setLimit] = useState(50);

  const [items, setItems] = useState<MatchResultDto[]>([]);
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isReservationsLoading, setIsReservationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservationsError, setReservationsError] = useState<string | null>(null);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);

  const [selectedMatch, setSelectedMatch] = useState<MatchResultDto | null>(null);


  const [finalizedReservations, setFinalizedReservations] = useState<ReservationResponse[]>([]);
const [isHistoryLoading, setIsHistoryLoading] = useState(false);
const [historyError, setHistoryError] = useState<string | null>(null);



const loadFinalizedReservations = useCallback(async () => {
  if (!canLoadFromApi) {
    setFinalizedReservations([]);
    setHistoryError(null);
    return;
  }

  setIsHistoryLoading(true);
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
    setIsHistoryLoading(false);
  }
}, [canLoadFromApi]);


  const filters = useMemo<MatchFilters>(
    () => ({
      medicineName,
      area,
      criticalOnly,
      limit
    }),
    [area, criticalOnly, limit, medicineName]
  );

  const criticalCount = useMemo(
    () => items.filter((item) => item.priority === 'Critical').length,
    [items]
  );

  const recommendedCount = useMemo(
    () => items.filter((item) => item.recommended === true).length,
    [items]
  );

  const totalSuggested = useMemo(
    () =>
      items.reduce((total, item) => {
        return total + Number(item.suggestedQuantity || 0);
      }, 0),
    [items]
  );

  const loadMatches = useCallback(
    async (overrideFilters?: MatchFilters) => {
      if (!canLoadFromApi) {
        setError(
          'Não foi possível carregar cruzamentos agora: dispositivo offline ou API indisponível.'
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchMatches(overrideFilters ?? filters);
        setItems(result);
      } catch (currentError) {
        const message =
          currentError instanceof Error
            ? currentError.message
            : 'Falha ao carregar cruzamentos.';

        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [canLoadFromApi, filters]
  );

  const loadReservations = useCallback(async () => {
    if (!canLoadFromApi) {
      setReservations([]);
      setReservationsError(null);
      return;
    }

    setIsReservationsLoading(true);
    setReservationsError(null);

    try {
      const result = await fetchActiveReservations();
      setReservations(result);
    } catch (currentError) {
      const message =
        currentError instanceof Error
          ? currentError.message
          : 'Falha ao carregar reservas.';

      setReservationsError(message);
    } finally {
      setIsReservationsLoading(false);
    }
  }, [canLoadFromApi]);

  // async function refreshAll() {
  //   await Promise.all([loadMatches(), loadReservations()]);
  // }

  async function refreshAll() {
  await Promise.all([
    loadMatches(),
    loadReservations(),
    loadFinalizedReservations()
  ]);
}

  function resetFilters(): void {
    setMedicineName('');
    setArea('');
    setCriticalOnly(false);
    setLimit(50);
  }

  function handleClose(): void {
    resetFilters();
    setItems([]);
    setReservations([]);
    setError(null);
    setReservationsError(null);
    setOperationMessage(null);
    setIsLoading(false);
    setIsReservationsLoading(false);
    setSelectedMatch(null);
    setFinalizedReservations([]);
setHistoryError(null);
setIsHistoryLoading(false);
    onClose();
  }

  async function handleClearFilters() {
    const cleanFilters: MatchFilters = {
      medicineName: '',
      area: '',
      criticalOnly: false,
      limit: 50
    };

    resetFilters();
    setError(null);

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


  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-card matches-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="matches-modal-title"
      >
        <header className="modal-header modal-header--matches">
          <div>
            <p className="eyebrow">Cruzamentos</p>
            <h2 id="matches-modal-title">Oferta x demanda</h2>
            <p>
              Veja matches, reserve retirada e acompanhe reservas ativas para
              evitar disputa pelo mesmo estoque.
            </p>
          </div>

          <button
            type="button"
            className="icon-button"
            aria-label="Fechar"
            onClick={handleClose}
          >
            ×
          </button>
        </header>

        <div className="matches-content">
          <section className="matches-filters">
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
              <span>Limite</span>
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

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={criticalOnly}
                onChange={(event) => setCriticalOnly(event.target.checked)}
              />
              <span>Apenas críticas</span>
            </label>

            <button
              type="button"
              className="submit-button"
              disabled={isLoading || !canLoadFromApi}
              onClick={() => void refreshAll()}
            >
              {isLoading ? 'Carregando...' : 'Atualizar lista'}
            </button>
          </section>

          <div className="matches-secondary-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => void handleClearFilters()}
              disabled={isLoading}
            >
              Limpar filtros
            </button>
          </div>

          <section className="matches-summary">
            <div>
              <strong>{items.length}</strong>
              <span>cruzamento(s)</span>
            </div>

            <div>
              <strong>{recommendedCount}</strong>
              <span>melhor(es) opção(ões)</span>
            </div>

            <div>
              <strong>{reservations.length}</strong>
              <span>reserva(s) ativa(s)</span>
            </div>

            <div>
              <strong>{criticalCount}</strong>
              <span>crítico(s)</span>
            </div>

            <div>
              <strong>{formatQuantity(totalSuggested)}</strong>
              <span>qtd. sugerida total</span>
            </div>
          </section>

          <section className="matches-export-row">
            <a
              href={buildExportUrl(API_ENDPOINTS.exportMatchesTxt, filters)}
              target="_blank"
              rel="noreferrer"
            >
              Exportar TXT
            </a>

            <a
              href={buildExportUrl(API_ENDPOINTS.exportMatchesCsv, filters)}
              target="_blank"
              rel="noreferrer"
            >
              Exportar CSV
            </a>
          </section>

          {operationMessage && (
            <p className="form-message form-message--success">
              {operationMessage}
            </p>
          )}

 <ActiveReservationsPanel
  activeReservations={reservations}
  finalizedReservations={finalizedReservations}
  isLoading={isReservationsLoading}
  isHistoryLoading={isHistoryLoading}
  error={reservationsError}
  historyError={historyError}
  canUseApi={canLoadFromApi}
  onRefresh={loadReservations}
  onRefreshHistory={loadFinalizedReservations}
  onExpireOld={handleExpireOldReservations}
  onChangeStatus={handleChangeReservationStatus}
/>

          {error && <p className="form-message form-message--error">{error}</p>}

          {!error && items.length === 0 && !isLoading && (
            <section className="empty-state">
              <strong>Nenhum cruzamento encontrado.</strong>
              <p>
                Pode não haver oferta compatível, estoque livre suficiente, ou os
                dados offline ainda não foram sincronizados com a API.
              </p>
            </section>
          )}

          <div className="matches-list">
            {items.map((match) => {
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
                      disabled={!canLoadFromApi || availableQuantity <= 0}
                      onClick={() => setSelectedMatch(match)}
                    >
                      {availableQuantity > 0
                        ? 'Reservar retirada'
                        : 'Sem estoque livre'}
                    </button>

                    {!canLoadFromApi && (
                      <span>
                        Reserva indisponível offline. Sincronize quando houver
                        sinal.
                      </span>
                    )}
                  </div>

                  <p className="match-action">
                    Ação sugerida: coordenação validar disponibilidade real,
                    transporte e prioridade clínica.
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <ReservationCreateModal
        isOpen={selectedMatch !== null}
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onCreated={handleReservationCreated}
      />
    </div>
  );
}