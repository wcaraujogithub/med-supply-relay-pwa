/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */


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