/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */


import { localDb, notifyOfflineStorageChanged } from './localDb';
import {
  createClientId,
  getOperatorAlias,
  getOrCreateDeviceId
} from './deviceIdentity';
import type {
  DemandPriority,
  LocalDemandItem,
  LocalReliefLocation,
  LocalSupplyItem,
  OfflineCounts,
  OfflineSyncBatchRequest,
  ReliefLocationType,
  RejectedSyncItemDto
} from './localTypes';

export type SaveReliefLocationInput = {
  name: string;
  code?: string | null;
  type: ReliefLocationType;
  area?: string | null;
  contactAlias?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
};

export type SaveSupplyInput = {
  locationClientOperationId: string;
  medicineName: string;
  medicineCode?: string | null;
  quantity: number;
  unit: string;
  expiresOn?: string | null;
  batchNumber?: string | null;
  notes?: string | null;
};

export type SaveDemandInput = {
  locationClientOperationId: string;
  medicineName: string;
  medicineCode?: string | null;
  requestedQuantity: number;
  unit: string;
  priority: DemandPriority;
  patientGroup?: string | null;
  notes?: string | null;
};

export async function findOrCreateOfflineLocation(
  input: SaveReliefLocationInput
): Promise<LocalReliefLocation> {
  const normalizedCode = normalizeOptional(input.code);
  const normalizedName = normalizeRequired(input.name);
  const normalizedArea = normalizeOptional(input.area);

  if (normalizedCode) {
    const existingByCode = await localDb.reliefLocations
      .where('code')
      .equalsIgnoreCase(normalizedCode)
      .first();

    if (existingByCode) {
      return existingByCode;
    }
  }

  const allLocations = await localDb.reliefLocations.toArray();

  const existingByNameTypeArea = allLocations.find((location) => {
    return (
      normalizeCompare(location.name) === normalizeCompare(normalizedName) &&
      location.type === input.type &&
      normalizeCompare(location.area) === normalizeCompare(normalizedArea)
    );
  });

  if (existingByNameTypeArea) {
    return existingByNameTypeArea;
  }

  return saveOfflineLocation(input);
}

export async function saveOfflineLocation(
  input: SaveReliefLocationInput
): Promise<LocalReliefLocation> {
  const now = new Date().toISOString();
  const deviceId = getOrCreateDeviceId();
  const operatorAlias = getOperatorAlias();

  const location: LocalReliefLocation = {
    clientOperationId: createClientId(),
    name: normalizeRequired(input.name),
    code: normalizeOptional(input.code),
    type: input.type,
    area: normalizeOptional(input.area),
    contactAlias: normalizeOptional(input.contactAlias),
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    address: normalizeOptional(input.address),
    contactName: normalizeOptional(input.contactName),
    contactPhone: normalizeOptional(input.contactPhone),
    notes: normalizeOptional(input.notes),
    sourceDeviceId: deviceId,
    operatorAlias,
    createdAtLocal: now,
    updatedAtLocal: now,
    syncStatus: 'pending',
    lastSyncError: null
  };

  const localId = await localDb.reliefLocations.add(location);
  location.localId = localId;

  await addSyncLog('info', `Local salvo offline: ${location.name}`);
  notifyOfflineStorageChanged();

  return location;
}

export async function saveOfflineSupply(
  input: SaveSupplyInput
): Promise<LocalSupplyItem> {
  const now = new Date().toISOString();
  const deviceId = getOrCreateDeviceId();
  const operatorAlias = getOperatorAlias();

  const supply: LocalSupplyItem = {
    clientOperationId: createClientId(),
    locationClientOperationId: input.locationClientOperationId,
    medicineName: normalizeRequired(input.medicineName),
    medicineCode: normalizeOptional(input.medicineCode),
    quantity: input.quantity,
    unit: normalizeRequired(input.unit),
    expiresOn: normalizeOptional(input.expiresOn),
    batchNumber: normalizeOptional(input.batchNumber),
    notes: normalizeOptional(input.notes),
    sourceDeviceId: deviceId,
    operatorAlias,
    createdAtLocal: now,
    updatedAtLocal: now,
    syncStatus: 'pending',
    lastSyncError: null
  };

  const localId = await localDb.supplyItems.add(supply);
  supply.localId = localId;

  await addSyncLog('info', `Oferta salva offline: ${supply.medicineName}`);
  notifyOfflineStorageChanged();

  return supply;
}

export async function saveOfflineDemand(
  input: SaveDemandInput
): Promise<LocalDemandItem> {
  const now = new Date().toISOString();
  const deviceId = getOrCreateDeviceId();
  const operatorAlias = getOperatorAlias();

  const demand: LocalDemandItem = {
    clientOperationId: createClientId(),
    locationClientOperationId: input.locationClientOperationId,
    medicineName: normalizeRequired(input.medicineName),
    medicineCode: normalizeOptional(input.medicineCode),
    requestedQuantity: input.requestedQuantity,
    unit: normalizeRequired(input.unit),
    priority: input.priority,
    patientGroup: normalizeOptional(input.patientGroup),
    notes: normalizeOptional(input.notes),
    sourceDeviceId: deviceId,
    operatorAlias,
    createdAtLocal: now,
    updatedAtLocal: now,
    syncStatus: 'pending',
    lastSyncError: null
  };

  const localId = await localDb.demandItems.add(demand);
  demand.localId = localId;

  await addSyncLog('info', `Demanda salva offline: ${demand.medicineName}`);
  notifyOfflineStorageChanged();

  return demand;
}

export async function getOfflineCounts(): Promise<OfflineCounts> {
  const [
    pendingLocations,
    pendingSupplies,
    pendingDemands,
    failedLocations,
    failedSupplies,
    failedDemands,
    syncingLocations,
    syncingSupplies,
    syncingDemands,
    syncedLocations,
    syncedSupplies,
    syncedDemands,
    totalLocations,
    totalSupplies,
    totalDemands
  ] = await Promise.all([
    localDb.reliefLocations.where('syncStatus').equals('pending').count(),
    localDb.supplyItems.where('syncStatus').equals('pending').count(),
    localDb.demandItems.where('syncStatus').equals('pending').count(),

    localDb.reliefLocations.where('syncStatus').equals('failed').count(),
    localDb.supplyItems.where('syncStatus').equals('failed').count(),
    localDb.demandItems.where('syncStatus').equals('failed').count(),

    localDb.reliefLocations.where('syncStatus').equals('syncing').count(),
    localDb.supplyItems.where('syncStatus').equals('syncing').count(),
    localDb.demandItems.where('syncStatus').equals('syncing').count(),

    localDb.reliefLocations.where('syncStatus').equals('synced').count(),
    localDb.supplyItems.where('syncStatus').equals('synced').count(),
    localDb.demandItems.where('syncStatus').equals('synced').count(),

    localDb.reliefLocations.count(),
    localDb.supplyItems.count(),
    localDb.demandItems.count()
  ]);

  return {
    pendingLocations,
    pendingSupplies,
    pendingDemands,
    failedLocations,
    failedSupplies,
    failedDemands,
    syncingLocations,
    syncingSupplies,
    syncingDemands,
    syncedLocations,
    syncedSupplies,
    syncedDemands,
    totalLocations,
    totalSupplies,
    totalDemands
  };
}

export async function createOfflineSyncBatchPayload():
  Promise<OfflineSyncBatchRequest | null> {
  const [locations, supplies, demands] = await Promise.all([
    localDb.reliefLocations
      .where('syncStatus')
      .anyOf(['pending', 'failed'])
      .toArray(),

    localDb.supplyItems
      .where('syncStatus')
      .anyOf(['pending', 'failed'])
      .toArray(),

    localDb.demandItems
      .where('syncStatus')
      .anyOf(['pending', 'failed'])
      .toArray()
  ]);

  if (locations.length === 0 && supplies.length === 0 && demands.length === 0) {
    return null;
  }

  return {
    clientBatchId: createClientId(),
    deviceId: getOrCreateDeviceId(),
    operatorAlias: getOperatorAlias(),
    sentAtUtc: new Date().toISOString(),
    locations: locations.map((location) => ({
      clientOperationId: location.clientOperationId,
      name: location.name,
      code: location.code,
      type: location.type,
      area: location.area,
      contactAlias: location.contactAlias,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      contactName: location.contactName,
      contactPhone: location.contactPhone,
      notes: location.notes,
      createdAtLocal: location.createdAtLocal
    })),
    supplies: supplies.map((supply) => ({
      clientOperationId: supply.clientOperationId,
      locationClientOperationId: supply.locationClientOperationId,
      medicineName: supply.medicineName,
      medicineCode: supply.medicineCode,
      quantity: supply.quantity,
      unit: supply.unit,
      expiresOn: supply.expiresOn,
      batchNumber: supply.batchNumber,
      notes: supply.notes,
      createdAtLocal: supply.createdAtLocal
    })),
    demands: demands.map((demand) => ({
      clientOperationId: demand.clientOperationId,
      locationClientOperationId: demand.locationClientOperationId,
      medicineName: demand.medicineName,
      medicineCode: demand.medicineCode,
      requestedQuantity: demand.requestedQuantity,
      unit: demand.unit,
      priority: demand.priority,
      patientGroup: demand.patientGroup,
      notes: demand.notes,
      createdAtLocal: demand.createdAtLocal
    }))
  };
}

export async function createLocalSyncBatch(
  payload: OfflineSyncBatchRequest
): Promise<void> {
  const now = new Date().toISOString();

  await localDb.syncBatches.add({
    clientBatchId: payload.clientBatchId,
    deviceId: payload.deviceId,
    operatorAlias: payload.operatorAlias ?? null,
    status: 'syncing',
    totalLocations: payload.locations.length,
    totalSupplies: payload.supplies.length,
    totalDemands: payload.demands.length,
    createdAtLocal: now,
    updatedAtLocal: now,
    sentAtUtc: payload.sentAtUtc,
    completedAtUtc: null,
    lastError: null
  });
}

export async function markPayloadItemsAsSyncing(
  payload: OfflineSyncBatchRequest
): Promise<void> {
  const now = new Date().toISOString();

  await localDb.transaction(
    'rw',
    localDb.reliefLocations,
    localDb.supplyItems,
    localDb.demandItems,
    async () => {
      await markEntitiesByClientOperationIds(
        localDb.reliefLocations,
        payload.locations.map((item) => item.clientOperationId),
        {
          syncStatus: 'syncing',
          updatedAtLocal: now,
          lastSyncError: null
        }
      );

      await markEntitiesByClientOperationIds(
        localDb.supplyItems,
        payload.supplies.map((item) => item.clientOperationId),
        {
          syncStatus: 'syncing',
          updatedAtLocal: now,
          lastSyncError: null
        }
      );

      await markEntitiesByClientOperationIds(
        localDb.demandItems,
        payload.demands.map((item) => item.clientOperationId),
        {
          syncStatus: 'syncing',
          updatedAtLocal: now,
          lastSyncError: null
        }
      );
    }
  );

  notifyOfflineStorageChanged();
}

export async function markPayloadItemsAsFailed(
  payload: OfflineSyncBatchRequest,
  errorMessage: string
): Promise<void> {
  const now = new Date().toISOString();

  await localDb.transaction(
    'rw',
    localDb.reliefLocations,
    localDb.supplyItems,
    localDb.demandItems,
    localDb.syncBatches,
    async () => {
      await markEntitiesByClientOperationIds(
        localDb.reliefLocations,
        payload.locations.map((item) => item.clientOperationId),
        {
          syncStatus: 'failed',
          updatedAtLocal: now,
          lastSyncError: errorMessage
        }
      );

      await markEntitiesByClientOperationIds(
        localDb.supplyItems,
        payload.supplies.map((item) => item.clientOperationId),
        {
          syncStatus: 'failed',
          updatedAtLocal: now,
          lastSyncError: errorMessage
        }
      );

      await markEntitiesByClientOperationIds(
        localDb.demandItems,
        payload.demands.map((item) => item.clientOperationId),
        {
          syncStatus: 'failed',
          updatedAtLocal: now,
          lastSyncError: errorMessage
        }
      );

      await localDb.syncBatches
        .where('clientBatchId')
        .equals(payload.clientBatchId)
        .modify({
          status: 'failed',
          updatedAtLocal: now,
          completedAtUtc: new Date().toISOString(),
          lastError: errorMessage
        });
    }
  );

  await addSyncLog('error', `Falha na sincronização: ${errorMessage}`, {
    clientBatchId: payload.clientBatchId
  });

  notifyOfflineStorageChanged();
}

export async function applySyncSuccess(
  payload: OfflineSyncBatchRequest,
  rejections: RejectedSyncItemDto[],
  isPartial: boolean
): Promise<void> {
  const now = new Date().toISOString();

  const rejectedLocationIds = new Set<string>();
  const rejectedSupplyIds = new Set<string>();
  const rejectedDemandIds = new Set<string>();

  for (const rejection of rejections) {
    const clientOperationId = rejection.clientOperationId;

    if (!clientOperationId) {
      continue;
    }

    const type = normalizeCompare(
      rejection.itemType ?? rejection.entityType ?? ''
    );

    if (type.includes('location')) {
      rejectedLocationIds.add(clientOperationId);
    } else if (type.includes('supply')) {
      rejectedSupplyIds.add(clientOperationId);
    } else if (type.includes('demand')) {
      rejectedDemandIds.add(clientOperationId);
    }
  }

  await localDb.transaction(
    'rw',
    localDb.reliefLocations,
    localDb.supplyItems,
    localDb.demandItems,
    localDb.syncBatches,
    async () => {
      await markAcceptedAndRejected(
        localDb.reliefLocations,
        payload.locations.map((item) => item.clientOperationId),
        rejectedLocationIds,
        now
      );

      await markAcceptedAndRejected(
        localDb.supplyItems,
        payload.supplies.map((item) => item.clientOperationId),
        rejectedSupplyIds,
        now
      );

      await markAcceptedAndRejected(
        localDb.demandItems,
        payload.demands.map((item) => item.clientOperationId),
        rejectedDemandIds,
        now
      );

      await localDb.syncBatches
        .where('clientBatchId')
        .equals(payload.clientBatchId)
        .modify({
          status: isPartial ? 'failed' : 'synced',
          updatedAtLocal: now,
          completedAtUtc: new Date().toISOString(),
          lastError: isPartial
            ? 'Batch parcialmente aceito. Alguns itens foram rejeitados.'
            : null
        });
    }
  );

  await addSyncLog(
    isPartial ? 'warning' : 'info',
    isPartial
      ? 'Sincronização concluída parcialmente.'
      : 'Sincronização concluída com sucesso.',
    {
      clientBatchId: payload.clientBatchId,
      rejections
    }
  );

  notifyOfflineStorageChanged();
}

export async function seedDemoOfflineData(): Promise<void> {
  const shelter = await findOrCreateOfflineLocation({
    name: 'Abrigo Demo Offline',
    code: 'ABRIGO-DEMO',
    type: 'Shelter',
    area: 'La Guaira',
    contactAlias: 'coordenação demo',
    notes: 'Registro local criado para teste offline.'
  });

  const hospital = await findOrCreateOfflineLocation({
    name: 'Hospital Demo Offline',
    code: 'HOSP-DEMO',
    type: 'Hospital',
    area: 'Caracas',
    contactAlias: 'triagem demo',
    notes: 'Registro local criado para teste offline.'
  });

  await saveOfflineSupply({
    locationClientOperationId: shelter.clientOperationId,
    medicineName: 'Paracetamol 500mg',
    quantity: 10,
    unit: 'caixas',
    notes: 'Oferta demo salva no IndexedDB.'
  });

  await saveOfflineDemand({
    locationClientOperationId: hospital.clientOperationId,
    medicineName: 'Paracetamol 500mg',
    requestedQuantity: 5,
    unit: 'caixas',
    priority: 'Critical',
    notes: 'Demanda demo salva no IndexedDB.'
  });

  await addSyncLog('info', 'Dados demo offline criados.');
  notifyOfflineStorageChanged();
}

export async function resetLocalDatabase(): Promise<void> {
  await localDb.transaction(
    'rw',
    localDb.reliefLocations,
    localDb.supplyItems,
    localDb.demandItems,
    localDb.syncBatches,
    localDb.syncLogs,
    async () => {
      await localDb.reliefLocations.clear();
      await localDb.supplyItems.clear();
      await localDb.demandItems.clear();
      await localDb.syncBatches.clear();
      await localDb.syncLogs.clear();
    }
  );

  notifyOfflineStorageChanged();
}

export async function addSyncLog(
  level: 'info' | 'warning' | 'error',
  message: string,
  metadata?: unknown
): Promise<void> {
  await localDb.syncLogs.add({
    level,
    message,
    createdAtLocal: new Date().toISOString(),
    metadataJson: metadata ? JSON.stringify(metadata) : null
  });
}

async function markEntitiesByClientOperationIds(
  table: {
    where: (index: string) => {
      anyOf: (keys: string[]) => {
        modify: (changes: Record<string, unknown>) => Promise<number>;
      };
    };
  },
  ids: string[],
  changes: Record<string, unknown>
): Promise<void> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return;
  }

  await table
    .where('clientOperationId')
    .anyOf(uniqueIds)
    .modify(changes);
}

async function markAcceptedAndRejected<
  T extends {
    clientOperationId: string;
    syncStatus: string;
    updatedAtLocal: string;
    lastSyncError?: string | null;
  }
>(
  table: {
    where: (index: string) => {
      anyOf: (keys: string[]) => {
        modify: (
          callback: (entity: T) => void
        ) => Promise<number>;
      };
    };
  },
  ids: string[],
  rejectedIds: Set<string>,
  now: string
): Promise<void> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return;
  }

  await table
    .where('clientOperationId')
    .anyOf(uniqueIds)
    .modify((entity: T) => {
      entity.updatedAtLocal = now;

      if (rejectedIds.has(entity.clientOperationId)) {
        entity.syncStatus = 'failed';
        entity.lastSyncError = 'Item rejeitado pela API durante sincronização.';
      } else {
        entity.syncStatus = 'synced';
        entity.lastSyncError = null;
      }
    });
}

function normalizeRequired(value: string): string {
  return value.trim();
}

function normalizeOptional(value?: string | null): string | null {
  if (!value || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

function normalizeCompare(value?: string | null): string {
  return (value ?? '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}