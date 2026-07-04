// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Wesley Cordeiro de Araujo
// See NOTICE for additional attribution and origin notices.

import { API_ENDPOINTS } from '../../config/api';
import {
  applySyncSuccess,
  createLocalSyncBatch,
  createOfflineSyncBatchPayload,
  markPayloadItemsAsFailed,
  markPayloadItemsAsSyncing
} from '../../db/offlineQueue';
import {
  recordSyncFailure,
  recordSyncResponseIssues,
  SYNC_ISSUES_UPDATED_EVENT
} from '../../db/offlineSyncIssues';
import type {
  OfflineSyncBatchResponse,
  SyncRunResult
} from '../../db/localTypes';

let currentSyncPromise: Promise<SyncRunResult> | null = null;

type ApiFailureInfo = {
  userMessage: string;
  technicalMessage: string;
  metadata: {
    failureType: 'http';
    httpStatus: number;
    problemType?: string;
    problemTitle?: string;
    traceId?: string;
  };
};

type ProblemDetailsPayload = {
  type?: unknown;
  title?: unknown;
  status?: unknown;
  detail?: unknown;
  traceId?: unknown;
  extensions?: unknown;
};

export function syncPendingOfflineData(
  reason: string
): Promise<SyncRunResult> {
  if (currentSyncPromise) {
    return currentSyncPromise;
  }

  currentSyncPromise = runSync(reason).finally(() => {
    currentSyncPromise = null;
  });

  return currentSyncPromise;
}

async function runSync(reason: string): Promise<SyncRunResult> {
  const payload = await createOfflineSyncBatchPayload();

  if (!payload) {
    notifySyncIssuesUpdated();

    return {
      status: 'idle',
      message: 'Nenhum item pendente para sincronizar.',
      totalLocations: 0,
      totalSupplies: 0,
      totalDemands: 0,
      acceptedLocations: 0,
      acceptedSupplies: 0,
      acceptedDemands: 0,
      rejectedItems: 0,
      duplicateItems: 0
    };
  }

  const payloadTotal =
    payload.locations.length +
    payload.supplies.length +
    payload.demands.length;

  await createLocalSyncBatch(payload);
  await markPayloadItemsAsSyncing(payload);

  notifySyncIssuesUpdated();

  try {
    const response = await fetch(API_ENDPOINTS.syncBatch, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-MedSupply-Sync-Reason': reason
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const failure = await readApiFailure(response);

      await markPayloadItemsAsFailed(
        payload,
        failure.technicalMessage
      );

      await safeRecordSyncFailure(
        failure.userMessage,
        {
          ...failure.metadata,
          syncReason: reason,
          clientBatchId: payload.clientBatchId,
          affectedItems: payloadTotal
        }
      );

      return {
        status: 'failed',
        message: failure.userMessage,
        clientBatchId: payload.clientBatchId,
        totalLocations: payload.locations.length,
        totalSupplies: payload.supplies.length,
        totalDemands: payload.demands.length,
        acceptedLocations: 0,
        acceptedSupplies: 0,
        acceptedDemands: 0,

        // Infrastructure failure is not a business rejection.
        rejectedItems: 0,
        duplicateItems: 0
      };
    }

    const data = (await response.json()) as OfflineSyncBatchResponse;

    const rejectionCount = Array.isArray(data.rejections)
      ? data.rejections.length
      : Number(data.rejectedItems ?? 0) || 0;

    const isPartial =
      data.status?.toLowerCase() === 'partiallyaccepted' ||
      data.status?.toLowerCase() === 'partially_accepted' ||
      rejectionCount > 0;

    const isFailed =
      data.status?.toLowerCase() === 'failed';

    if (isFailed) {
      const technicalMessage =
        'The sync API rejected or failed the entire sync batch.';

      await markPayloadItemsAsFailed(
        payload,
        technicalMessage
      );

      await safeRecordSyncResponseIssues(data);

      if (rejectionCount === 0) {
        await safeRecordSyncFailure(
          'A API não conseguiu processar o lote de sincronização.',
          {
            failureType: 'api-batch',
            status: data.status ?? 'failed',
            syncReason: reason,
            clientBatchId: payload.clientBatchId,
            affectedItems: payloadTotal
          }
        );
      }

      return {
        status: 'failed',
        message:
          rejectionCount > 0
            ? `A API rejeitou ${rejectionCount} item(ns) do lote de sincronização.`
            : 'A API não conseguiu processar o lote de sincronização.',
        clientBatchId: payload.clientBatchId,
        totalLocations:
          data.totalLocations ?? payload.locations.length,
        totalSupplies:
          data.totalSupplies ?? payload.supplies.length,
        totalDemands:
          data.totalDemands ?? payload.demands.length,
        acceptedLocations:
          data.acceptedLocations ?? 0,
        acceptedSupplies:
          data.acceptedSupplies ?? 0,
        acceptedDemands:
          data.acceptedDemands ?? 0,
        rejectedItems: rejectionCount,
        duplicateItems:
          data.duplicateItems ?? 0
      };
    }

    await applySyncSuccess(
      payload,
      data.rejections ?? [],
      isPartial
    );

    await safeRecordSyncResponseIssues(data);

    return {
      status: isPartial ? 'partial' : 'success',
      message: buildSuccessMessage(data, isPartial),
      clientBatchId:
        data.clientBatchId ?? payload.clientBatchId,
      totalLocations:
        data.totalLocations ?? payload.locations.length,
      totalSupplies:
        data.totalSupplies ?? payload.supplies.length,
      totalDemands:
        data.totalDemands ?? payload.demands.length,
      acceptedLocations:
        data.acceptedLocations ?? 0,
      acceptedSupplies:
        data.acceptedSupplies ?? 0,
      acceptedDemands:
        data.acceptedDemands ?? 0,
      rejectedItems: rejectionCount,
      duplicateItems:
        data.duplicateItems ?? 0
    };
  } catch (error) {
    const technicalMessage =
      error instanceof Error
        ? sanitizeTechnicalMessage(error.message)
        : 'Unknown synchronization error.';

    const userMessage =
      'Não foi possível sincronizar com o servidor. Os dados continuam salvos neste dispositivo. Tente novamente quando o serviço estiver disponível.';

    await markPayloadItemsAsFailed(
      payload,
      technicalMessage
    );

    await safeRecordSyncFailure(
      userMessage,
      {
        failureType: 'network',
        syncReason: reason,
        clientBatchId: payload.clientBatchId,
        affectedItems: payloadTotal,
        technicalMessage
      }
    );

    return {
      status: 'failed',
      message: userMessage,
      clientBatchId: payload.clientBatchId,
      totalLocations: payload.locations.length,
      totalSupplies: payload.supplies.length,
      totalDemands: payload.demands.length,
      acceptedLocations: 0,
      acceptedSupplies: 0,
      acceptedDemands: 0,

      // Network/infrastructure failures are not rejections.
      rejectedItems: 0,
      duplicateItems: 0
    };
  } finally {
    notifySyncIssuesUpdated();
  }
}

function buildSuccessMessage(
  data: OfflineSyncBatchResponse,
  isPartial: boolean
): string {
  if (data.alreadyProcessed) {
    return 'Lote já havia sido processado pela API. Dados locais marcados como sincronizados.';
  }

  if (isPartial) {
    return `Sincronização parcial: ${data.acceptedLocations} locais, ${data.acceptedSupplies} ofertas, ${data.acceptedDemands} demandas aceitas; ${data.rejectedItems} rejeitado(s).`;
  }

  return `Sincronização concluída: ${data.acceptedLocations} locais, ${data.acceptedSupplies} ofertas e ${data.acceptedDemands} demandas enviadas.`;
}

async function readApiFailure(
  response: Response
): Promise<ApiFailureInfo> {
  const fallbackUserMessage = buildHttpUserMessage(
    response.status
  );

  const fallbackTechnicalMessage =
    `Sync API returned HTTP ${response.status}.`;

  try {
    const rawText = await response.text();

    if (!rawText.trim()) {
      return {
        userMessage: fallbackUserMessage,
        technicalMessage: fallbackTechnicalMessage,
        metadata: {
          failureType: 'http',
          httpStatus: response.status
        }
      };
    }

    const parsed = safeParseJson(rawText);

    if (!parsed) {
      return {
        userMessage: fallbackUserMessage,
        technicalMessage: fallbackTechnicalMessage,
        metadata: {
          failureType: 'http',
          httpStatus: response.status
        }
      };
    }

    const problem = parsed as ProblemDetailsPayload;

    const problemType = getStringValue(problem.type);
    const problemTitle = getStringValue(problem.title);

    const traceId =
      getStringValue(problem.traceId) ??
      findTraceId(problem.extensions);

    return {
      userMessage: fallbackUserMessage,
      technicalMessage:
        problemTitle
          ? `HTTP ${response.status}: ${sanitizeTechnicalMessage(problemTitle)}`
          : fallbackTechnicalMessage,
      metadata: {
        failureType: 'http',
        httpStatus: response.status,
        problemType,
        problemTitle:
          problemTitle
            ? sanitizeTechnicalMessage(problemTitle)
            : undefined,
        traceId
      }
    };
  } catch {
    return {
      userMessage: fallbackUserMessage,
      technicalMessage: fallbackTechnicalMessage,
      metadata: {
        failureType: 'http',
        httpStatus: response.status
      }
    };
  }
}

function buildHttpUserMessage(status: number): string {
  if (status >= 500) {
    return 'O servidor está temporariamente indisponível para sincronização. Os dados continuam salvos neste dispositivo. Tente novamente em alguns instantes.';
  }

  if (status === 408 || status === 504) {
    return 'A sincronização demorou mais que o esperado. Os dados continuam salvos neste dispositivo. Tente novamente quando a conexão estiver estável.';
  }

  if (status === 429) {
    return 'O servidor recebeu muitas solicitações. Os dados continuam salvos neste dispositivo. Aguarde alguns instantes e tente novamente.';
  }

  return `Não foi possível sincronizar com o servidor (HTTP ${status}). Os dados continuam salvos neste dispositivo.`;
}

function safeParseJson(
  value: string
): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value);

    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, unknown>;
    }

    return null;
  } catch {
    return null;
  }
}

function getStringValue(
  value: unknown
): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();

  return normalized || undefined;
}

function findTraceId(
  extensions: unknown
): string | undefined {
  if (
    !extensions ||
    typeof extensions !== 'object' ||
    Array.isArray(extensions)
  ) {
    return undefined;
  }

  const record = extensions as Record<string, unknown>;

  return (
    getStringValue(record.traceId) ??
    getStringValue(record.trace_id) ??
    getStringValue(record.requestId) ??
    getStringValue(record.request_id)
  );
}

function sanitizeTechnicalMessage(
  value: string
): string {
  const compact = value
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (compact.length <= 240) {
    return compact;
  }

  return `${compact.slice(0, 237)}...`;
}

async function safeRecordSyncResponseIssues(
  response: Parameters<typeof recordSyncResponseIssues>[0]
): Promise<void> {
  try {
    await recordSyncResponseIssues(response);
  } catch (error) {
    console.warn(
      'Failed to record sync response issues locally.',
      error
    );
  }
}

async function safeRecordSyncFailure(
  message: string,
  metadata?: unknown
): Promise<void> {
  try {
    await recordSyncFailure(message, metadata);
  } catch (error) {
    console.warn(
      'Failed to record sync failure locally.',
      error
    );
  }
}

function notifySyncIssuesUpdated(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(SYNC_ISSUES_UPDATED_EVENT)
  );
}