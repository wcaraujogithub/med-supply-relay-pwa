/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */

import { useEffect, useMemo, useState } from 'react';
import { getOperatorAlias } from '../../db/deviceIdentity';
import { formatAppNumber } from '../../i18n/format';
import { useI18n } from '../../i18n/I18nProvider';
import type { MatchResultDto } from '../matches/matchesTypes';
import { createReservationFromMatch } from './reservationsApi';
import type { ReservationResponse } from './reservationTypes';

type ReservationCreateModalProps = {
  match: MatchResultDto | null;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (reservation: ReservationResponse) => Promise<void> | void;
};

function parseQuantity(value: string): number {
  return Number(value.replace(',', '.'));
}

export function ReservationCreateModal({
  match,
  isOpen,
  onClose,
  onCreated
}: ReservationCreateModalProps) {
  const { language, t } = useI18n();

  const availableQuantity = useMemo(() => {
    if (!match) {
      return 0;
    }

    return match.supplyAvailableQuantity ?? match.supplyQuantity ?? 0;
  }, [match]);

  const defaultQuantity = useMemo(() => {
    if (!match) {
      return 0;
    }

    return Math.min(match.suggestedQuantity, availableQuantity);
  }, [availableQuantity, match]);

  const [quantity, setQuantity] = useState('');
  const [holdMinutes, setHoldMinutes] = useState(120);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !match) {
      return;
    }

    setQuantity(String(defaultQuantity || ''));
    setHoldMinutes(120);
    setNotes('');
    setError(null);
    setSuccessMessage(null);
  }, [defaultQuantity, isOpen, match]);

  if (!isOpen || !match) {
    return null;
  }

  async function handleSubmit() {
    if (!match) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    const parsedQuantity = parseQuantity(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError(t('reservationModal.invalidQty'));
      return;
    }

    if (parsedQuantity > availableQuantity) {
      setError(
        t('reservationModal.overQty', {
          quantity: formatAppNumber(availableQuantity, language),
          unit: match.unit
        })
      );
      return;
    }

    setIsSaving(true);

    try {
      const reservation = await createReservationFromMatch(
        match,
        parsedQuantity,
        holdMinutes,
        notes
      );

      setSuccessMessage(t('reservationModal.success'));
      await onCreated(reservation);
    } catch (currentError) {
      const message =
        currentError instanceof Error
          ? currentError.message
          : t('reservationModal.fail');

      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleClose() {
    setError(null);
    setSuccessMessage(null);
    onClose();
  }

  return (
    <div className="modal-backdrop reservation-modal-backdrop" role="presentation">
      <section
        className="modal-card reservation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-create-title"
      >
        <header className="modal-header modal-header--matches">
          <div>
            <p className="eyebrow">{t('reservationModal.eyebrow')}</p>
            <h2 id="reservation-create-title">{t('reservationModal.title')}</h2>
            <p>{t('reservationModal.description')}</p>
          </div>

          <button
            type="button"
            className="icon-button"
            aria-label={t('reservationModal.close')}
            onClick={handleClose}
          >
            ×
          </button>
        </header>

        <div className="reservation-create-content">
          <section className="reservation-target">
            <h3>{match.medicineName}</h3>

            <div className="reservation-route">
              <div>
                <span>{t('matches.needs')}</span>
                <strong>{match.demandLocationName ?? '-'}</strong>
              </div>

              <div>
                <span>{t('matches.hasAvailable')}</span>
                <strong>{match.supplyLocationName ?? '-'}</strong>
              </div>
            </div>

            <div className="reservation-stock-grid">
              <div>
                <span>{t('matches.totalSupply')}</span>
                <strong>
                  {formatAppNumber(match.supplyTotalQuantity ?? match.supplyQuantity, language)}{' '}
                  {match.unit}
                </strong>
              </div>

              <div>
                <span>{t('matches.reserved')}</span>
                <strong>
                  {formatAppNumber(match.supplyReservedQuantity ?? 0, language)}{' '}
                  {match.unit}
                </strong>
              </div>

              <div>
                <span>{t('matches.freeNow')}</span>
                <strong>
                  {formatAppNumber(availableQuantity, language)} {match.unit}
                </strong>
              </div>

              <div>
                <span>{t('matches.suggestion')}</span>
                <strong>
                  {formatAppNumber(match.suggestedQuantity, language)} {match.unit}
                </strong>
              </div>
            </div>
          </section>

          <section className="reservation-form">
            <label>
              <span>{t('reservationModal.quantity')}</span>
              <input
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                inputMode="decimal"
                placeholder="5"
              />
            </label>

            <label>
              <span>{t('reservationModal.time')}</span>
              <select
                value={holdMinutes}
                onChange={(event) => setHoldMinutes(Number(event.target.value))}
              >
                <option value={30}>{t('reservationModal.30m')}</option>
                <option value={60}>{t('reservationModal.60m')}</option>
                <option value={120}>{t('reservationModal.120m')}</option>
                <option value={240}>{t('reservationModal.240m')}</option>
                <option value={480}>{t('reservationModal.480m')}</option>
              </select>
            </label>

            <label className="full-width">
              <span>{t('reservationModal.notes')}</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder={t('reservationModal.notesPlaceholder')}
              />
            </label>

            <p className="reservation-operator-note">
              {t('reservationModal.operator', {
                value: getOperatorAlias() ?? t('reservationModal.noOperator')
              })}
            </p>
          </section>

          {error && <p className="form-message form-message--error">{error}</p>}

          {successMessage && (
            <p className="form-message form-message--success">{successMessage}</p>
          )}

          <footer className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleClose}
              disabled={isSaving}
            >
              {t('reservationModal.close')}
            </button>

            <button
              type="button"
              className="submit-button"
              onClick={() => void handleSubmit()}
              disabled={isSaving || availableQuantity <= 0}
            >
              {isSaving ? t('reservationModal.saving') : t('reservationModal.confirm')}
            </button>
          </footer>
        </div>
      </section>
    </div>
  );
}