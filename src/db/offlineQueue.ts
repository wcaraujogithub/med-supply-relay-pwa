// import { localDb, notifyOfflineStorageChanged } from './localDb';
// import {
//   createClientId,
//   getOperatorAlias,
//   getOrCreateDeviceId
// } from './deviceIdentity';
// import type {
//   DemandPriority,
//   LocalDemandItem,
//   LocalReliefLocation,
//   LocalSupplyItem,
//   OfflineCounts,
//   OfflineSyncBatchRequest,
//   ReliefLocationType
// } from './localTypes';

// export type SaveReliefLocationInput = {
//   name: string;
//   code?: string | null;
//   type: ReliefLocationType;
//   area?: string | null;
//   contactAlias?: string | null;
//   latitude?: number | null;
//   longitude?: number | null;
//   address?: string | null;
//   contactName?: string | null;
//   contactPhone?: string | null;
//   notes?: string | null;
// };

// export type SaveSupplyInput = {
//   locationClientOperationId: string;
//   medicineName: string;
//   medicineCode?: string | null;
//   quantity: number;
//   unit: string;
//   expiresOn?: string | null;
//   batchNumber?: string | null;
//   notes?: string | null;
// };

// type SaveDemandInput = {
//   locationClientOperationId: string;
//   medicineName: string;
//   medicineCode?: string | null;
//   requestedQuantity: number;
//   unit: string;
//   priority: DemandPriority;
//   patientGroup?: string | null;
//   notes?: string | null;
// };

// export async function saveOfflineLocation(
//   input: SaveReliefLocationInput
// ): Promise<LocalReliefLocation> {
//   const now = new Date().toISOString();
//   const deviceId = getOrCreateDeviceId();
//   const operatorAlias = getOperatorAlias();

//   const location: LocalReliefLocation = {
//     clientOperationId: createClientId(),
//     name: normalizeRequired(input.name),
//     code: normalizeOptional(input.code),
//     type: input.type,
//     area: normalizeOptional(input.area),
//     contactAlias: normalizeOptional(input.contactAlias),
//     latitude: input.latitude ?? null,
//     longitude: input.longitude ?? null,
//     address: normalizeOptional(input.address),
//     contactName: normalizeOptional(input.contactName),
//     contactPhone: normalizeOptional(input.contactPhone),
//     notes: normalizeOptional(input.notes),
//     sourceDeviceId: deviceId,
//     operatorAlias,
//     createdAtLocal: now,
//     updatedAtLocal: now,
//     syncStatus: 'pending',
//     lastSyncError: null
//   };

//   const localId = await localDb.reliefLocations.add(location);
//   location.localId = localId;

//   await addSyncLog('info', `Local salvo offline: ${location.name}`);
//   notifyOfflineStorageChanged();

//   return location;
// }

// export async function saveOfflineSupply(
//   input: SaveSupplyInput
// ): Promise<LocalSupplyItem> {
//   const now = new Date().toISOString();
//   const deviceId = getOrCreateDeviceId();
//   const operatorAlias = getOperatorAlias();

//   const supply: LocalSupplyItem = {
//     clientOperationId: createClientId(),
//     locationClientOperationId: input.locationClientOperationId,
//     medicineName: normalizeRequired(input.medicineName),
//     medicineCode: normalizeOptional(input.medicineCode),
//     quantity: input.quantity,
//     unit: normalizeRequired(input.unit),
//     expiresOn: normalizeOptional(input.expiresOn),
//     batchNumber: normalizeOptional(input.batchNumber),
//     notes: normalizeOptional(input.notes),
//     sourceDeviceId: deviceId,
//     operatorAlias,
//     createdAtLocal: now,
//     updatedAtLocal: now,
//     syncStatus: 'pending',
//     lastSyncError: null
//   };

//   const localId = await localDb.supplyItems.add(supply);
//   supply.localId = localId;

//   await addSyncLog('info', `Oferta salva offline: ${supply.medicineName}`);
//   notifyOfflineStorageChanged();

//   return supply;
// }

// export async function saveOfflineDemand(
//   input: SaveDemandInput
// ): Promise<LocalDemandItem> {
//   const now = new Date().toISOString();
//   const deviceId = getOrCreateDeviceId();
//   const operatorAlias = getOperatorAlias();

//   const demand: LocalDemandItem = {
//     clientOperationId: createClientId(),
//     locationClientOperationId: input.locationClientOperationId,
//     medicineName: normalizeRequired(input.medicineName),
//     medicineCode: normalizeOptional(input.medicineCode),
//     requestedQuantity: input.requestedQuantity,
//     unit: normalizeRequired(input.unit),
//     priority: input.priority,
//     patientGroup: normalizeOptional(input.patientGroup),
//     notes: normalizeOptional(input.notes),
//     sourceDeviceId: deviceId,
//     operatorAlias,
//     createdAtLocal: now,
//     updatedAtLocal: now,
//     syncStatus: 'pending',
//     lastSyncError: null
//   };

//   const localId = await localDb.demandItems.add(demand);
//   demand.localId = localId;

//   await addSyncLog('info', `Demanda salva offline: ${demand.medicineName}`);
//   notifyOfflineStorageChanged();

//   return demand;
// }

// export async function getOfflineCounts(): Promise<OfflineCounts> {
//   const [
//     pendingLocations,
//     pendingSupplies,
//     pendingDemands,
//     failedLocations,
//     failedSupplies,
//     failedDemands,
//     syncedLocations,
//     syncedSupplies,
//     syncedDemands,
//     totalLocations,
//     totalSupplies,
//     totalDemands
//   ] = await Promise.all([
//     localDb.reliefLocations.where('syncStatus').equals('pending').count(),
//     localDb.supplyItems.where('syncStatus').equals('pending').count(),
//     localDb.demandItems.where('syncStatus').equals('pending').count(),

//     localDb.reliefLocations.where('syncStatus').equals('failed').count(),
//     localDb.supplyItems.where('syncStatus').equals('failed').count(),
//     localDb.demandItems.where('syncStatus').equals('failed').count(),

//     localDb.reliefLocations.where('syncStatus').equals('synced').count(),
//     localDb.supplyItems.where('syncStatus').equals('synced').count(),
//     localDb.demandItems.where('syncStatus').equals('synced').count(),

//     localDb.reliefLocations.count(),
//     localDb.supplyItems.count(),
//     localDb.demandItems.count()
//   ]);

//   return {
//     pendingLocations,
//     pendingSupplies,
//     pendingDemands,
//     failedLocations,
//     failedSupplies,
//     failedDemands,
//     syncedLocations,
//     syncedSupplies,
//     syncedDemands,
//     totalLocations,
//     totalSupplies,
//     totalDemands
//   };
// }

// export async function createOfflineSyncBatchPayload():
//   Promise<OfflineSyncBatchRequest | null> {
//   const [locations, supplies, demands] = await Promise.all([
//     localDb.reliefLocations
//       .where('syncStatus')
//       .anyOf(['pending', 'failed'])
//       .toArray(),

//     localDb.supplyItems
//       .where('syncStatus')
//       .anyOf(['pending', 'failed'])
//       .toArray(),

//     localDb.demandItems
//       .where('syncStatus')
//       .anyOf(['pending', 'failed'])
//       .toArray()
//   ]);

//   if (locations.length === 0 && supplies.length === 0 && demands.length === 0) {
//     return null;
//   }

//   return {
//     clientBatchId: createClientId(),
//     deviceId: getOrCreateDeviceId(),
//     operatorAlias: getOperatorAlias(),
//     sentAtUtc: new Date().toISOString(),
//     locations: locations.map((location) => ({
//       clientOperationId: location.clientOperationId,
//       name: location.name,
//       code: location.code,
//       type: location.type,
//       area: location.area,
//       contactAlias: location.contactAlias,
//       latitude: location.latitude,
//       longitude: location.longitude,
//       address: location.address,
//       contactName: location.contactName,
//       contactPhone: location.contactPhone,
//       notes: location.notes,
//       createdAtLocal: location.createdAtLocal
//     })),
//     supplies: supplies.map((supply) => ({
//       clientOperationId: supply.clientOperationId,
//       locationClientOperationId: supply.locationClientOperationId,
//       medicineName: supply.medicineName,
//       medicineCode: supply.medicineCode,
//       quantity: supply.quantity,
//       unit: supply.unit,
//       expiresOn: supply.expiresOn,
//       batchNumber: supply.batchNumber,
//       notes: supply.notes,
//       createdAtLocal: supply.createdAtLocal
//     })),
//     demands: demands.map((demand) => ({
//       clientOperationId: demand.clientOperationId,
//       locationClientOperationId: demand.locationClientOperationId,
//       medicineName: demand.medicineName,
//       medicineCode: demand.medicineCode,
//       requestedQuantity: demand.requestedQuantity,
//       unit: demand.unit,
//       priority: demand.priority,
//       patientGroup: demand.patientGroup,
//       notes: demand.notes,
//       createdAtLocal: demand.createdAtLocal
//     }))
//   };
// }

// export async function seedDemoOfflineData(): Promise<void> {
//   const shelter = await saveOfflineLocation({
//     name: 'Abrigo Demo Offline',
//     code: 'ABRIGO-DEMO',
//     type: 'Shelter',
//     area: 'La Guaira',
//     contactAlias: 'coordenação demo',
//     notes: 'Registro local criado para teste offline.'
//   });

//   const hospital = await saveOfflineLocation({
//     name: 'Hospital Demo Offline',
//     code: 'HOSP-DEMO',
//     type: 'Hospital',
//     area: 'Caracas',
//     contactAlias: 'triagem demo',
//     notes: 'Registro local criado para teste offline.'
//   });

//   await saveOfflineSupply({
//     locationClientOperationId: shelter.clientOperationId,
//     medicineName: 'Paracetamol 500mg',
//     quantity: 10,
//     unit: 'caixas',
//     notes: 'Oferta demo salva no IndexedDB.'
//   });

//   await saveOfflineDemand({
//     locationClientOperationId: hospital.clientOperationId,
//     medicineName: 'Paracetamol 500mg',
//     requestedQuantity: 5,
//     unit: 'caixas',
//     priority: 'Critical',
//     notes: 'Demanda demo salva no IndexedDB.'
//   });

//   await addSyncLog('info', 'Dados demo offline criados.');
//   notifyOfflineStorageChanged();
// }

// export async function resetLocalDatabase(): Promise<void> {
//   await localDb.transaction(
//     'rw',
//     localDb.reliefLocations,
//     localDb.supplyItems,
//     localDb.demandItems,
//     localDb.syncBatches,
//     localDb.syncLogs,
//     async () => {
//       await localDb.reliefLocations.clear();
//       await localDb.supplyItems.clear();
//       await localDb.demandItems.clear();
//       await localDb.syncBatches.clear();
//       await localDb.syncLogs.clear();
//     }
//   );

//   notifyOfflineStorageChanged();
// }

// export async function addSyncLog(
//   level: 'info' | 'warning' | 'error',
//   message: string,
//   metadata?: unknown
// ): Promise<void> {
//   await localDb.syncLogs.add({
//     level,
//     message,
//     createdAtLocal: new Date().toISOString(),
//     metadataJson: metadata ? JSON.stringify(metadata) : null
//   });
// }

// function normalizeRequired(value: string): string {
//   return value.trim();
// }

// function normalizeOptional(value?: string | null): string | null {
//   if (!value || value.trim().length === 0) {
//     return null;
//   }

//   return value.trim();
// }


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
  ReliefLocationType
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