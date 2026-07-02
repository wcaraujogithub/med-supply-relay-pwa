import { API_ENDPOINTS } from '../../config/api';
import {
  applySyncSuccess,
  createLocalSyncBatch,
  createOfflineSyncBatchPayload,
  markPayloadItemsAsFailed,
  markPayloadItemsAsSyncing
} from '../../db/offlineQueue';
import type {
  OfflineSyncBatchResponse,
  SyncRunResult
} from '../../db/localTypes';

let currentSyncPromise: Promise<SyncRunResult> | null = null;

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

  await createLocalSyncBatch(payload);
  await markPayloadItemsAsSyncing(payload);

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
      const errorText = await safeReadText(response);
      const message = errorText || `API returned HTTP ${response.status}.`;

      await markPayloadItemsAsFailed(payload, message);

      return {
        status: 'failed',
        message: `Falha ao sincronizar: ${message}`,
        clientBatchId: payload.clientBatchId,
        totalLocations: payload.locations.length,
        totalSupplies: payload.supplies.length,
        totalDemands: payload.demands.length,
        acceptedLocations: 0,
        acceptedSupplies: 0,
        acceptedDemands: 0,
        rejectedItems: payload.locations.length + payload.supplies.length + payload.demands.length,
        duplicateItems: 0
      };
    }

    const data = (await response.json()) as OfflineSyncBatchResponse;

    const isPartial =
      data.status?.toLowerCase() === 'partiallyaccepted' ||
      data.status?.toLowerCase() === 'partially_accepted' ||
      data.rejectedItems > 0;

    const isFailed =
      data.status?.toLowerCase() === 'failed';

    if (isFailed) {
      const message = 'API rejected the entire sync batch.';
      await markPayloadItemsAsFailed(payload, message);

      return {
        status: 'failed',
        message: 'A API rejeitou todo o lote de sincronização.',
        clientBatchId: payload.clientBatchId,
        totalLocations: data.totalLocations ?? payload.locations.length,
        totalSupplies: data.totalSupplies ?? payload.supplies.length,
        totalDemands: data.totalDemands ?? payload.demands.length,
        acceptedLocations: data.acceptedLocations ?? 0,
        acceptedSupplies: data.acceptedSupplies ?? 0,
        acceptedDemands: data.acceptedDemands ?? 0,
        rejectedItems: data.rejectedItems ?? 0,
        duplicateItems: data.duplicateItems ?? 0
      };
    }

    await applySyncSuccess(payload, data.rejections ?? [], isPartial);

    return {
      status: isPartial ? 'partial' : 'success',
      message: buildSuccessMessage(data, isPartial),
      clientBatchId: data.clientBatchId ?? payload.clientBatchId,
      totalLocations: data.totalLocations ?? payload.locations.length,
      totalSupplies: data.totalSupplies ?? payload.supplies.length,
      totalDemands: data.totalDemands ?? payload.demands.length,
      acceptedLocations: data.acceptedLocations ?? 0,
      acceptedSupplies: data.acceptedSupplies ?? 0,
      acceptedDemands: data.acceptedDemands ?? 0,
      rejectedItems: data.rejectedItems ?? 0,
      duplicateItems: data.duplicateItems ?? 0
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Erro desconhecido durante sincronização.';

    await markPayloadItemsAsFailed(payload, message);

    return {
      status: 'failed',
      message: `Falha ao sincronizar: ${message}`,
      clientBatchId: payload.clientBatchId,
      totalLocations: payload.locations.length,
      totalSupplies: payload.supplies.length,
      totalDemands: payload.demands.length,
      acceptedLocations: 0,
      acceptedSupplies: 0,
      acceptedDemands: 0,
      rejectedItems: payload.locations.length + payload.supplies.length + payload.demands.length,
      duplicateItems: 0
    };
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

async function safeReadText(response: Response): Promise<string | null> {
  try {
    return await response.text();
  } catch {
    return null;
  }
}