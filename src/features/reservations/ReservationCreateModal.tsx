import { useEffect, useMemo, useState } from 'react';
import { getOperatorAlias } from '../../db/deviceIdentity';
import type { MatchResultDto } from '../matches/matchesTypes';
import { createReservationFromMatch } from './reservationsApi';
import type { ReservationResponse } from './reservationTypes';

type ReservationCreateModalProps = {
  match: MatchResultDto | null;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (reservation: ReservationResponse) => Promise<void> | void;
};

function formatQuantity(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 3
  }).format(value);
}

function parseQuantity(value: string): number {
  return Number(value.replace(',', '.'));
}

export function ReservationCreateModal({
  match,
  isOpen,
  onClose,
  onCreated
}: ReservationCreateModalProps) {
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
      setError('Informe uma quantidade válida para reservar.');
      return;
    }

    if (parsedQuantity > availableQuantity) {
      setError(
        `Quantidade maior que o livre agora: ${formatQuantity(
          availableQuantity
        )} ${match.unit}.`
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

      setSuccessMessage('Reserva criada com sucesso.');
      await onCreated(reservation);
    } catch (currentError) {
      const message =
        currentError instanceof Error
          ? currentError.message
          : 'Não foi possível criar a reserva.';

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
            <p className="eyebrow">Reserva online</p>
            <h2 id="reservation-create-title">Reservar retirada</h2>
            <p>
              A reserva precisa de internet e será confirmada pelo servidor para
              evitar que duas equipes busquem o mesmo medicamento.
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

        <div className="reservation-create-content">
          <section className="reservation-target">
            <h3>{match.medicineName}</h3>

            <div className="reservation-route">
              <div>
                <span>Precisa</span>
                <strong>{match.demandLocationName ?? '-'}</strong>
              </div>

              <div>
                <span>Tem disponível</span>
                <strong>{match.supplyLocationName ?? '-'}</strong>
              </div>
            </div>

            <div className="reservation-stock-grid">
              <div>
                <span>Total oferta</span>
                <strong>
                  {formatQuantity(match.supplyTotalQuantity ?? match.supplyQuantity)}{' '}
                  {match.unit}
                </strong>
              </div>

              <div>
                <span>Reservado</span>
                <strong>
                  {formatQuantity(match.supplyReservedQuantity ?? 0)} {match.unit}
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
          </section>

          <section className="reservation-form">
            <label>
              <span>Quantidade a reservar *</span>
              <input
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                inputMode="decimal"
                placeholder="Ex.: 5"
              />
            </label>

            <label>
              <span>Tempo de reserva</span>
              <select
                value={holdMinutes}
                onChange={(event) => setHoldMinutes(Number(event.target.value))}
              >
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={120}>2 horas</option>
                <option value={240}>4 horas</option>
                <option value={480}>8 horas</option>
              </select>
            </label>

            <label className="full-width">
              <span>Observação</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Ex.: equipe vai buscar agora, veículo 01"
              />
            </label>

            <p className="reservation-operator-note">
              Operador: <strong>{getOperatorAlias() ?? 'não informado'}</strong>
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
              Fechar
            </button>

            <button
              type="button"
              className="submit-button"
              onClick={() => void handleSubmit()}
              disabled={isSaving || availableQuantity <= 0}
            >
              {isSaving ? 'Reservando...' : 'Confirmar reserva'}
            </button>
          </footer>
        </div>
      </section>
    </div>
  );
}