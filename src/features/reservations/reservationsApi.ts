/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */


import { API_ENDPOINTS } from '../../config/api';
import {
  createClientId,
  getOperatorAlias,
  getOrCreateDeviceId
} from '../../db/deviceIdentity';
import type { MatchResultDto } from '../matches/matchesTypes';
import type {
  ChangeReservationStatusRequest,
  ExpireOldReservationsResponse,
  ReservationAction,
  ReservationResponse
} from './reservationTypes';

export async function createReservationFromMatch(
  match: MatchResultDto,
  quantity: number,
  holdMinutes: number,
  notes: string | null
): Promise<ReservationResponse> {
  const payload = {
    demandId: match.demandId,
    supplyId: match.supplyId,
    quantity,
    clientOperationId: createClientId(),
    reservedByDeviceId: getOrCreateDeviceId(),
    reservedByOperatorAlias: getOperatorAlias(),
    holdMinutes,
    notes
  };

  const response = await fetch(`${API_ENDPOINTS.reservations}/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as ReservationResponse;
}

export async function fetchActiveReservations(): Promise<ReservationResponse[]> {
  const url = new URL(API_ENDPOINTS.reservations);
  url.searchParams.set('activeOnly', 'true');
  url.searchParams.set('limit', '200');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as ReservationResponse[];
}

export async function fetchFinalizedReservations(): Promise<ReservationResponse[]> {
  const url = new URL(API_ENDPOINTS.reservations);
  url.searchParams.set('finalizedOnly', 'true');
  url.searchParams.set('limit', '100');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as ReservationResponse[];
}

export async function changeReservationStatus(
  reservationId: string,
  action: ReservationAction,
  notes?: string | null
): Promise<ReservationResponse> {
  const payload: ChangeReservationStatusRequest = {
    operatorAlias: getOperatorAlias(),
    notes: notes?.trim() ? notes.trim() : null
  };

  const response = await fetch(
    `${API_ENDPOINTS.reservations}/${reservationId}/${action}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as ReservationResponse;
}

export async function expireOldReservations(): Promise<ExpireOldReservationsResponse> {
  const response = await fetch(`${API_ENDPOINTS.reservations}/expire-old`, {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as ExpireOldReservationsResponse;
}

async function readApiError(response: Response): Promise<string> {
  try {
    const text = await response.text();

    if (!text) {
      return `Erro HTTP ${response.status}.`;
    }

    try {
      const json = JSON.parse(text) as {
        message?: string;
        code?: string;
        error?: string;
      };

      return json.message ?? json.error ?? json.code ?? text;
    } catch {
      return text;
    }
  } catch {
    return `Erro HTTP ${response.status}.`;
  }
}