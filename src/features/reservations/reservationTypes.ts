// export type ReservationStatus =
//   | 'Pending'
//   | 'Confirmed'
//   | 'InTransit'
//   | 'Delivered'
//   | 'Cancelled'
//   | 'Expired'
//   | string;

// export type ReservationAction =
//   | 'confirm'
//   | 'in-transit'
//   | 'delivered'
//   | 'cancel';

// export interface CreateReservationRequest {
//   demandId: string;
//   supplyId: string;
//   quantity: number;
//   clientOperationId: string;
//   reservedByDeviceId: string;
//   reservedByOperatorAlias?: string | null;
//   holdMinutes?: number | null;
//   notes?: string | null;
// }

// export interface ChangeReservationStatusRequest {
//   operatorAlias?: string | null;
//   notes?: string | null;
// }

// export interface ReservationResponse {
//   id: string;
//   clientOperationId: string;
//   demandId: string;
//   supplyId: string;
//   medicineName: string;
//   unit: string;
//   requestedQuantity: number;
//   reservedQuantity: number;
//   supplyTotalQuantity: number;
//   supplyReservedQuantity: number;
//   supplyAvailableQuantity: number;
//   status: ReservationStatus;
//   demandLocationName?: string | null;
//   supplyLocationName?: string | null;
//   reservedByDeviceId: string;
//   reservedByOperatorAlias?: string | null;
//   reservedAtUtc: string;
//   reservedUntilUtc: string;
//   confirmedAtUtc?: string | null;
//   inTransitAtUtc?: string | null;
//   deliveredAtUtc?: string | null;
//   cancelledAtUtc?: string | null;
//   expiredAtUtc?: string | null;
//   notes?: string | null;
// }


export type ReservationStatus =
  | 'Pending'
  | 'Confirmed'
  | 'InTransit'
  | 'Delivered'
  | 'Cancelled'
  | 'Expired'
  | string;

export type ReservationAction =
  | 'confirm'
  | 'in-transit'
  | 'delivered'
  | 'cancel';

export interface ChangeReservationStatusRequest {
  operatorAlias?: string | null;
  notes?: string | null;
}

export interface ReservationResponse {
  id: string;
  clientOperationId: string;
  demandId: string;
  supplyId: string;
  medicineName: string;
  unit: string;
  requestedQuantity: number;
  reservedQuantity: number;
  supplyTotalQuantity: number;
  supplyReservedQuantity: number;
  supplyAvailableQuantity: number;
  status: ReservationStatus;
  demandLocationName?: string | null;
  supplyLocationName?: string | null;
  reservedByDeviceId: string;
  reservedByOperatorAlias?: string | null;
  reservedAtUtc: string;
  reservedUntilUtc: string;
  confirmedAtUtc?: string | null;
  inTransitAtUtc?: string | null;
  deliveredAtUtc?: string | null;
  cancelledAtUtc?: string | null;
  expiredAtUtc?: string | null;
  notes?: string | null;
}

export interface ExpireOldReservationsResponse {
  expiredCount: number;
  expiredAtUtc: string;
}