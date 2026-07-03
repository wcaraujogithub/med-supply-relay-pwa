// import type {
//   ReservationAction,
//   ReservationResponse,
//   ReservationStatus
// } from './reservationTypes';

// type ActiveReservationsPanelProps = {
//   activeReservations: ReservationResponse[];
//   finalizedReservations: ReservationResponse[];
//   isLoading: boolean;
//   isHistoryLoading: boolean;
//   error: string | null;
//   historyError: string | null;
//   canUseApi: boolean;
//   onRefresh: () => Promise<void> | void;
//   onRefreshHistory: () => Promise<void> | void;
//   onExpireOld: () => Promise<void> | void;
//   onChangeStatus: (
//     reservation: ReservationResponse,
//     action: ReservationAction
//   ) => Promise<void> | void;
// };

// function statusLabel(status: ReservationStatus): string {
//   switch (status) {
//     case 'Pending':
//       return 'Pendente';
//     case 'Confirmed':
//       return 'Confirmada';
//     case 'InTransit':
//       return 'Em trânsito';
//     case 'Delivered':
//       return 'Entregue';
//     case 'Cancelled':
//       return 'Cancelada';
//     case 'Expired':
//       return 'Expirada';
//     default:
//       return String(status);
//   }
// }

// function statusTone(status: ReservationStatus): string {
//   switch (status) {
//     case 'Pending':
//       return 'pending';
//     case 'Confirmed':
//       return 'confirmed';
//     case 'InTransit':
//       return 'transit';
//     case 'Delivered':
//       return 'delivered';
//     case 'Cancelled':
//       return 'cancelled';
//     case 'Expired':
//       return 'expired';
//     default:
//       return 'pending';
//   }
// }

// function formatQuantity(value: number): string {
//   return new Intl.NumberFormat('pt-BR', {
//     maximumFractionDigits: 3
//   }).format(value);
// }

// function formatDateTime(value: string): string {
//   return new Date(value).toLocaleString('pt-BR');
// }

// function minutesUntil(value: string): number {
//   return Math.floor((new Date(value).getTime() - Date.now()) / 60000);
// }

// function getExpiryTone(reservation: ReservationResponse): string {
//   const minutes = minutesUntil(reservation.reservedUntilUtc);

//   if (minutes <= 0) {
//     return 'expired-soon';
//   }

//   if (minutes <= 30) {
//     return 'warning';
//   }

//   return 'normal';
// }

// function expiryLabel(reservation: ReservationResponse): string {
//   const minutes = minutesUntil(reservation.reservedUntilUtc);

//   if (minutes <= 0) {
//     return 'Vencida';
//   }

//   if (minutes < 60) {
//     return `Expira em ${minutes} min`;
//   }

//   const hours = Math.floor(minutes / 60);
//   const rest = minutes % 60;

//   return `Expira em ${hours}h${rest.toString().padStart(2, '0')}`;
// }

// function getActions(status: ReservationStatus): ReservationAction[] {
//   switch (status) {
//     case 'Pending':
//       return ['confirm', 'cancel'];

//     case 'Confirmed':
//       return ['in-transit', 'cancel'];

//     case 'InTransit':
//       return ['delivered'];

//     default:
//       return [];
//   }
// }

// function actionLabel(action: ReservationAction): string {
//   switch (action) {
//     case 'confirm':
//       return 'Confirmar';
//     case 'in-transit':
//       return 'Em trânsito';
//     case 'delivered':
//       return 'Entregue';
//     case 'cancel':
//       return 'Cancelar';
//   }
// }

// export function ActiveReservationsPanel({
//   activeReservations,
//   finalizedReservations,
//   isLoading,
//   isHistoryLoading,
//   error,
//   historyError,
//   canUseApi,
//   onRefresh,
//   onRefreshHistory,
//   onExpireOld,
//   onChangeStatus
// }: ActiveReservationsPanelProps) {
//   return (
//     <section className="active-reservations-panel active-reservations-panel--page">
//       <div className="active-reservations-header">
//         <div>
//           <h3>Reservas ativas</h3>
//           <p>
//             Fluxo seguro: confirmar, marcar em trânsito e depois marcar como
//             entregue. Isso evita baixa de estoque sem rastreio operacional.
//           </p>
//         </div>

//         <div className="active-reservations-actions">
//           <button
//             type="button"
//             className="secondary-button"
//             onClick={() => void onRefresh()}
//             disabled={!canUseApi || isLoading}
//           >
//             {isLoading ? 'Atualizando...' : 'Atualizar ativas'}
//           </button>

//           <button
//             type="button"
//             className="secondary-button"
//             onClick={() => void onExpireOld()}
//             disabled={!canUseApi}
//           >
//             Expirar vencidas
//           </button>

//           <button
//             type="button"
//             className="secondary-button"
//             onClick={() => void onRefreshHistory()}
//             disabled={!canUseApi || isHistoryLoading}
//           >
//             {isHistoryLoading ? 'Carregando...' : 'Atualizar histórico'}
//           </button>
//         </div>
//       </div>

//       {error && <p className="form-message form-message--error">{error}</p>}

//       {!error && activeReservations.length === 0 && !isLoading && (
//         <div className="empty-state">
//           <strong>Nenhuma reserva ativa.</strong>
//           <p>Quando uma equipe reservar retirada, ela aparecerá aqui.</p>
//         </div>
//       )}

//       <div className="reservations-list">
//         {activeReservations.map((reservation) => {
//           const actions = getActions(reservation.status);
//           const expiryTone = getExpiryTone(reservation);

//           return (
//             <article
//               className={`reservation-card reservation-card--${expiryTone}`}
//               key={reservation.id}
//             >
//               <div className="reservation-card-top">
//                 <span
//                   className={`reservation-status reservation-status--${statusTone(
//                     reservation.status
//                   )}`}
//                 >
//                   {statusLabel(reservation.status)}
//                 </span>

//                 <span className={`reservation-expiry reservation-expiry--${expiryTone}`}>
//                   {expiryLabel(reservation)}
//                 </span>
//               </div>

//               <h4>{reservation.medicineName}</h4>

//               <div className="reservation-card-grid">
//                 <div>
//                   <span>Reservado</span>
//                   <strong>
//                     {formatQuantity(reservation.reservedQuantity)}{' '}
//                     {reservation.unit}
//                   </strong>
//                 </div>

//                 <div>
//                   <span>Demanda</span>
//                   <strong>{reservation.demandLocationName ?? '-'}</strong>
//                 </div>

//                 <div>
//                   <span>Oferta</span>
//                   <strong>{reservation.supplyLocationName ?? '-'}</strong>
//                 </div>

//                 <div>
//                   <span>Operador</span>
//                   <strong>{reservation.reservedByOperatorAlias ?? '-'}</strong>
//                 </div>
//               </div>

//               <p className="reservation-expiry-detail">
//                 Reservada até: {formatDateTime(reservation.reservedUntilUtc)}
//               </p>

//               {reservation.notes && (
//                 <p className="reservation-notes">{reservation.notes}</p>
//               )}

//               {actions.length > 0 && (
//                 <div className="reservation-actions">
//                   {actions.map((action) => (
//                     <button
//                       key={action}
//                       type="button"
//                       className={`reservation-action reservation-action--${action}`}
//                       disabled={!canUseApi}
//                       onClick={() => void onChangeStatus(reservation, action)}
//                     >
//                       {actionLabel(action)}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </article>
//           );
//         })}
//       </div>

//       <section className="reservation-history">
//         <h4>Histórico finalizado</h4>

//         {historyError && (
//           <p className="form-message form-message--error">{historyError}</p>
//         )}

//         {!historyError && finalizedReservations.length === 0 && !isHistoryLoading && (
//           <p className="reservation-history-empty">
//             Nenhuma reserva entregue, cancelada ou expirada carregada.
//           </p>
//         )}

//         <div className="reservation-history-list">
//           {finalizedReservations.map((reservation) => (
//             <article className="reservation-history-item" key={reservation.id}>
//               <span
//                 className={`reservation-status reservation-status--${statusTone(
//                   reservation.status
//                 )}`}
//               >
//                 {statusLabel(reservation.status)}
//               </span>

//               <strong>{reservation.medicineName}</strong>

//               <span>
//                 {formatQuantity(reservation.reservedQuantity)} {reservation.unit}
//               </span>

//               <small>
//                 {reservation.demandLocationName ?? '-'} ←{' '}
//                 {reservation.supplyLocationName ?? '-'}
//               </small>
//             </article>
//           ))}
//         </div>
//       </section>
//     </section>
//   );
// }


import { formatAppDateTime, formatAppNumber } from '../../i18n/format';
import { useI18n } from '../../i18n/I18nProvider';
import type {
  ReservationAction,
  ReservationResponse,
  ReservationStatus
} from './reservationTypes';

type ActiveReservationsPanelProps = {
  activeReservations: ReservationResponse[];
  finalizedReservations: ReservationResponse[];
  isLoading: boolean;
  isHistoryLoading: boolean;
  error: string | null;
  historyError: string | null;
  canUseApi: boolean;
  onRefresh: () => Promise<void> | void;
  onRefreshHistory: () => Promise<void> | void;
  onExpireOld: () => Promise<void> | void;
  onChangeStatus: (
    reservation: ReservationResponse,
    action: ReservationAction
  ) => Promise<void> | void;
};

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

function minutesUntil(value: string): number {
  return Math.floor((new Date(value).getTime() - Date.now()) / 60000);
}

function getExpiryTone(reservation: ReservationResponse): string {
  const minutes = minutesUntil(reservation.reservedUntilUtc);

  if (minutes <= 0) {
    return 'expired-soon';
  }

  if (minutes <= 30) {
    return 'warning';
  }

  return 'normal';
}

function getActions(status: ReservationStatus): ReservationAction[] {
  switch (status) {
    case 'Pending':
      return ['confirm', 'cancel'];

    case 'Confirmed':
      return ['in-transit', 'cancel'];

    case 'InTransit':
      return ['delivered'];

    default:
      return [];
  }
}

export function ActiveReservationsPanel({
  activeReservations,
  finalizedReservations,
  isLoading,
  isHistoryLoading,
  error,
  historyError,
  canUseApi,
  onRefresh,
  onRefreshHistory,
  onExpireOld,
  onChangeStatus
}: ActiveReservationsPanelProps) {
  const { language, t } = useI18n();

  function statusLabel(status: ReservationStatus): string {
    return t(`reservations.status.${status}`);
  }

  function actionLabel(action: ReservationAction): string {
    switch (action) {
      case 'confirm':
        return t('reservations.action.confirm');
      case 'in-transit':
        return t('reservations.action.inTransit');
      case 'delivered':
        return t('reservations.action.delivered');
      case 'cancel':
        return t('reservations.action.cancel');
    }
  }

  function expiryLabel(reservation: ReservationResponse): string {
    const minutes = minutesUntil(reservation.reservedUntilUtc);

    if (minutes <= 0) {
      return t('reservations.expiresNow');
    }

    if (minutes < 60) {
      return t('reservations.expiresMinutes', { minutes });
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return t('reservations.expiresHours', {
      hours,
      minutes: rest.toString().padStart(2, '0')
    });
  }

  return (
    <section className="active-reservations-panel active-reservations-panel--page">
      <div className="active-reservations-header">
        <div>
          <h3>{t('reservations.title')}</h3>
          <p>{t('reservations.description')}</p>
        </div>

        <div className="active-reservations-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => void onRefresh()}
            disabled={!canUseApi || isLoading}
          >
            {isLoading ? t('reservations.updating') : t('reservations.updateActive')}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => void onExpireOld()}
            disabled={!canUseApi}
          >
            {t('reservations.expireOld')}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => void onRefreshHistory()}
            disabled={!canUseApi || isHistoryLoading}
          >
            {isHistoryLoading
              ? t('reservations.loadingHistory')
              : t('reservations.updateHistory')}
          </button>
        </div>
      </div>

      {error && <p className="form-message form-message--error">{error}</p>}

      {!error && activeReservations.length === 0 && !isLoading && (
        <div className="empty-state">
          <strong>{t('reservations.emptyTitle')}</strong>
          <p>{t('reservations.emptyText')}</p>
        </div>
      )}

      <div className="reservations-list">
        {activeReservations.map((reservation) => {
          const actions = getActions(reservation.status);
          const expiryTone = getExpiryTone(reservation);

          return (
            <article
              className={`reservation-card reservation-card--${expiryTone}`}
              key={reservation.id}
            >
              <div className="reservation-card-top">
                <span
                  className={`reservation-status reservation-status--${statusTone(
                    reservation.status
                  )}`}
                >
                  {statusLabel(reservation.status)}
                </span>

                <span className={`reservation-expiry reservation-expiry--${expiryTone}`}>
                  {expiryLabel(reservation)}
                </span>
              </div>

              <h4>{reservation.medicineName}</h4>

              <div className="reservation-card-grid">
                <div>
                  <span>{t('reservations.reserved')}</span>
                  <strong>
                    {formatAppNumber(reservation.reservedQuantity, language)}{' '}
                    {reservation.unit}
                  </strong>
                </div>

                <div>
                  <span>{t('reservations.demand')}</span>
                  <strong>{reservation.demandLocationName ?? '-'}</strong>
                </div>

                <div>
                  <span>{t('reservations.supply')}</span>
                  <strong>{reservation.supplyLocationName ?? '-'}</strong>
                </div>

                <div>
                  <span>{t('reservations.operator')}</span>
                  <strong>{reservation.reservedByOperatorAlias ?? '-'}</strong>
                </div>
              </div>

              <p className="reservation-expiry-detail">
                {t('reservations.reservedUntil', {
                  value: formatAppDateTime(reservation.reservedUntilUtc, language)
                })}
              </p>

              {reservation.notes && (
                <p className="reservation-notes">{reservation.notes}</p>
              )}

              {actions.length > 0 && (
                <div className="reservation-actions">
                  {actions.map((action) => (
                    <button
                      key={action}
                      type="button"
                      className={`reservation-action reservation-action--${action}`}
                      disabled={!canUseApi}
                      onClick={() => void onChangeStatus(reservation, action)}
                    >
                      {actionLabel(action)}
                    </button>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <section className="reservation-history">
        <h4>{t('reservations.historyTitle')}</h4>

        {historyError && (
          <p className="form-message form-message--error">{historyError}</p>
        )}

        {!historyError && finalizedReservations.length === 0 && !isHistoryLoading && (
          <p className="reservation-history-empty">
            {t('reservations.historyEmpty')}
          </p>
        )}

        <div className="reservation-history-list">
          {finalizedReservations.map((reservation) => (
            <article className="reservation-history-item" key={reservation.id}>
              <span
                className={`reservation-status reservation-status--${statusTone(
                  reservation.status
                )}`}
              >
                {statusLabel(reservation.status)}
              </span>

              <strong>{reservation.medicineName}</strong>

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
    </section>
  );
}