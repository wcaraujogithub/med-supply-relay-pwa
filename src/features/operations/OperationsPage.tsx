
/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { formatAppNumber } from '../../i18n/format';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchMatches } from '../matches/matchesApi';
import type {
  MatchFilters,
  MatchPriority,
  MatchResultDto
} from '../matches/matchesTypes';
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

type OperationsTab = 'matches' | 'reservations' | 'history' | 'exports';

type OperationsPageProps = {
  canUseApi: boolean;
  onBack: () => void;
};

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
  const { language, t } = useI18n();

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
    () =>
      items.reduce((total, item) => {
        return total + Number(item.suggestedQuantity || 0);
      }, 0),
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

  function translatePriority(priority: MatchPriority): string {
    const key = `priority.${priority}`;
    const translated = t(key);

    return translated === key ? String(priority) : translated;
  }

  function translateReservationStatus(status: ReservationStatus): string {
    const key = `reservations.status.${status}`;
    const translated = t(key);

    return translated === key ? String(status) : translated;
  }

  const loadMatches = useCallback(
    async (requestFilters: MatchFilters) => {
      if (!canUseApi) {
        setMatchesError(t('matches.errorOffline'));
        return;
      }

      setIsLoadingMatches(true);
      setMatchesError(null);

      try {
        const result = await fetchMatches(requestFilters);
        setItems(result);
        setCurrentPage(1);
      } catch (currentError) {
        const message =
          currentError instanceof Error
            ? currentError.message
            : t('matches.errorLoad');

        setMatchesError(message);
      } finally {
        setIsLoadingMatches(false);
      }
    },
    [canUseApi, t]
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
          : t('reservations.activeLoadError');

      setReservationsError(message);
    } finally {
      setIsLoadingReservations(false);
    }
  }, [canUseApi, t]);

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
          : t('reservations.historyLoadError');

      setHistoryError(message);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [canUseApi, t]);

  const refreshAll = useCallback(
    async (requestFilters: MatchFilters) => {
      await Promise.all([
        loadMatches(requestFilters),
        loadActiveReservations(),
        loadFinalizedReservations()
      ]);
    },
    [loadActiveReservations, loadFinalizedReservations, loadMatches]
  );

  useEffect(() => {
    const initialFilters: MatchFilters = {
      medicineName: '',
      area: '',
      criticalOnly: false,
      limit: 100
    };

    void refreshAll(initialFilters);
  }, [refreshAll]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  async function handleApplyFilters() {
    await loadMatches(filters);
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
    setOperationMessage(t('reservations.created'));
    await refreshAll(filters);
  }

  async function handleChangeReservationStatus(
    reservation: ReservationResponse,
    action: ReservationAction
  ) {
    const note = window.prompt(t('reservations.notePrompt'), '');

    setOperationMessage(null);
    setReservationsError(null);

    try {
      await changeReservationStatus(reservation.id, action, note);
      setOperationMessage(t('reservations.statusUpdated'));
      await refreshAll(filters);
    } catch (currentError) {
      const message =
        currentError instanceof Error
          ? currentError.message
          : t('reservations.statusError');

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
          ? t('reservations.expireNone')
          : t('reservations.expireOk', { count: result.expiredCount })
      );

      await refreshAll(filters);
    } catch (currentError) {
      const message =
        currentError instanceof Error
          ? currentError.message
          : t('reservations.expireFail');

      setReservationsError(message);
    }
  }

  return (
    <main className="operations-page">
      <header className="operations-hero">
        <div>
          <p className="eyebrow">{t('operations.eyebrow')}</p>
          <h2>{t('operations.title')}</h2>
          <p>{t('operations.description')}</p>
        </div>

        <button type="button" className="secondary-button" onClick={onBack}>
          {t('operations.back')}
        </button>
      </header>

      <nav className="operations-tabs" aria-label={t('operations.title')}>
        <button
          type="button"
          className={activeTab === 'matches' ? 'active' : ''}
          onClick={() => setActiveTab('matches')}
        >
          {t('operations.tab.matches')}
        </button>

        <button
          type="button"
          className={activeTab === 'reservations' ? 'active' : ''}
          onClick={() => setActiveTab('reservations')}
        >
          {t('operations.tab.reservations')}
        </button>

        <button
          type="button"
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          {t('operations.tab.history')}
        </button>

        <button
          type="button"
          className={activeTab === 'exports' ? 'active' : ''}
          onClick={() => setActiveTab('exports')}
        >
          {t('operations.tab.exports')}
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
                <span>{t('filters.medicine')}</span>
                <input
                  value={medicineName}
                  onChange={(event) => setMedicineName(event.target.value)}
                  placeholder={t('filters.medicinePlaceholder')}
                />
              </label>

              <label>
                <span>{t('filters.area')}</span>
                <input
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  placeholder={t('filters.areaPlaceholder')}
                />
              </label>

              <label>
                <span>{t('filters.apiLimit')}</span>
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
                <span>{t('filters.pageSize')}</span>
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
                <span>{t('filters.criticalOnly')}</span>
              </label>
            </div>

            <div className="operations-filter-actions">
              <button
                type="button"
                className="submit-button"
                disabled={!canUseApi || isLoadingMatches}
                onClick={() => void handleApplyFilters()}
              >
                {isLoadingMatches
                  ? t('filters.loading')
                  : t('filters.updateMatches')}
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={isLoadingMatches}
                onClick={() => void handleClearFilters()}
              >
                {t('filters.clear')}
              </button>
            </div>
          </section>

          <section className="operations-summary-grid">
            <div>
              <strong>{items.length}</strong>
              <span>{t('summary.matches')}</span>
            </div>

            <div>
              <strong>{recommendedCount}</strong>
              <span>{t('summary.recommended')}</span>
            </div>

            <div>
              <strong>{activeReservations.length}</strong>
              <span>{t('summary.activeReservations')}</span>
            </div>

            <div>
              <strong>{criticalCount}</strong>
              <span>{t('summary.critical')}</span>
            </div>

            <div>
              <strong>{formatAppNumber(totalSuggested, language)}</strong>
              <span>{t('summary.suggestedTotal')}</span>
            </div>
          </section>

          {matchesError && (
            <p className="form-message form-message--error">{matchesError}</p>
          )}

          {!matchesError && items.length === 0 && !isLoadingMatches && (
            <section className="empty-state">
              <strong>{t('matches.emptyTitle')}</strong>
              <p>{t('matches.emptyText')}</p>
            </section>
          )}

          <div className="operations-list-header">
            <span>
              {t('matches.page', {
                current: currentPage,
                total: totalPages
              })}
            </span>

            <div className="operations-pagination">
              <button
                type="button"
                className="secondary-button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                {t('matches.prev')}
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
              >
                {t('matches.next')}
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
                          {t('matches.recommended')}
                        </span>
                      )}

                      <span
                        className={`priority-badge priority-badge--${priorityTone(
                          match.priority
                        )}`}
                      >
                        {translatePriority(match.priority)}
                      </span>
                    </div>

                    <div className="match-badges-right">
                      <span
                        className={`score-pill score-pill--${getScoreTone(score)}`}
                      >
                        {t('matches.score', { score })}
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
                      <span>{t('matches.needs')}</span>
                      <strong>{safe(match.demandLocationName)}</strong>
                      <small>{safe(match.demandLocationArea)}</small>
                    </div>

                    <div className="match-route__arrow">→</div>

                    <div className="match-route__box match-route__box--supply">
                      <span>{t('matches.hasAvailable')}</span>
                      <strong>{safe(match.supplyLocationName)}</strong>
                      <small>{safe(match.supplyLocationArea)}</small>
                    </div>
                  </div>

                  <div className="match-quantity-grid match-quantity-grid--reservation">
                    <div>
                      <span>{t('matches.required')}</span>
                      <strong>
                        {formatAppNumber(match.demandQuantity, language)}{' '}
                        {match.unit}
                      </strong>
                    </div>

                    <div>
                      <span>{t('matches.totalSupply')}</span>
                      <strong>
                        {formatAppNumber(totalQuantity, language)} {match.unit}
                      </strong>
                    </div>

                    <div>
                      <span>{t('matches.reserved')}</span>
                      <strong>
                        {formatAppNumber(reservedQuantity, language)}{' '}
                        {match.unit}
                      </strong>
                    </div>

                    <div>
                      <span>{t('matches.freeNow')}</span>
                      <strong>
                        {formatAppNumber(availableQuantity, language)}{' '}
                        {match.unit}
                      </strong>
                    </div>

                    <div>
                      <span>{t('matches.suggestion')}</span>
                      <strong>
                        {formatAppNumber(match.suggestedQuantity, language)}{' '}
                        {match.unit}
                      </strong>
                    </div>
                  </div>

                  {match.supplyExpiresOn && (
                    <p className="match-note">
                      {t('matches.expires', {
                        value: match.supplyExpiresOn
                      })}
                    </p>
                  )}

                  {reasons.length > 0 && (
                    <section className="recommendation-reasons">
                      <strong>{t('matches.why')}</strong>

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
                        ? t('matches.reservePickup')
                        : t('matches.noFreeStock')}
                    </button>

                    {!canUseApi && (
                      <span>{t('matches.offlineReserve')}</span>
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
              <h3>{t('history.title')}</h3>
              <p>{t('history.description')}</p>
            </div>

            <button
              type="button"
              className="submit-button"
              disabled={!canUseApi || isLoadingHistory}
              onClick={() => void loadFinalizedReservations()}
            >
              {isLoadingHistory
                ? t('reservations.loadingHistory')
                : t('reservations.updateHistory')}
            </button>
          </div>

          {historyError && (
            <p className="form-message form-message--error">{historyError}</p>
          )}

          {finalizedReservations.length === 0 && !isLoadingHistory && (
            <section className="empty-state">
              <strong>{t('history.emptyTitle')}</strong>
              <p>{t('history.emptyText')}</p>
            </section>
          )}

          <div className="reservation-history-list">
            {finalizedReservations.map((reservation) => (
              <article className="reservation-history-item" key={reservation.id}>
                <span
                  className={`reservation-status reservation-status--${statusTone(
                    reservation.status
                  )}`}
                >
                  {translateReservationStatus(reservation.status)}
                </span>

                <span>{reservation.medicineName}</span>

                <span>
                  {formatAppNumber(reservation.reservedQuantity, language)}{' '}
                  {reservation.unit}
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
          <h3>{t('exports.title')}</h3>
          <p>{t('exports.description')}</p>

          <div className="matches-export-row">
            <a
              href={buildExportUrl(API_ENDPOINTS.exportMatchesTxt, filters)}
              target="_blank"
              rel="noreferrer"
            >
              {t('exports.txt')}
            </a>

            <a
              href={buildExportUrl(API_ENDPOINTS.exportMatchesCsv, filters)}
              target="_blank"
              rel="noreferrer"
            >
              {t('exports.csv')}
            </a>
          </div>

          <section className="mvp-note operations-export-note">
            <h3>{t('exports.noteTitle')}</h3>
            <ul>
              <li>{t('exports.note1')}</li>
              <li>{t('exports.note2')}</li>
              <li>{t('exports.note3')}</li>
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