/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */
import Dexie, { type Table } from 'dexie';
import type {
  LocalDemandItem,
  LocalReliefLocation,
  LocalSupplyItem,
  LocalSyncBatch,
  LocalSyncLog
} from './localTypes';

export class MedSupplyRelayLocalDb extends Dexie {
  reliefLocations!: Table<LocalReliefLocation, number>;
  supplyItems!: Table<LocalSupplyItem, number>;
  demandItems!: Table<LocalDemandItem, number>;
  syncBatches!: Table<LocalSyncBatch, number>;
  syncLogs!: Table<LocalSyncLog, number>;

  constructor() {
    super('med_supply_relay_local');

    this.version(1).stores({
      reliefLocations:
        '++localId, clientOperationId, name, code, type, area, syncStatus, updatedAtLocal',
      supplyItems:
        '++localId, clientOperationId, locationClientOperationId, medicineName, medicineCode, unit, syncStatus, updatedAtLocal',
      demandItems:
        '++localId, clientOperationId, locationClientOperationId, medicineName, medicineCode, priority, unit, syncStatus, updatedAtLocal',
      syncBatches:
        '++localId, clientBatchId, deviceId, status, createdAtLocal, updatedAtLocal',
      syncLogs:
        '++localId, level, createdAtLocal'
    });
  }
}

export const localDb = new MedSupplyRelayLocalDb();

export const OFFLINE_STORAGE_CHANGED_EVENT = 'msr:offline-storage-changed';

export function notifyOfflineStorageChanged(): void {
  window.dispatchEvent(new CustomEvent(OFFLINE_STORAGE_CHANGED_EVENT));
}