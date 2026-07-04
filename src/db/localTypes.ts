/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */

export type LocalSyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export type ReliefLocationType =
  | 'Unknown'
  | 'Shelter'
  | 'Hospital'
  | 'MedicalPost'
  | 'Warehouse'
  | 'Ngo'
  | 'CollectionPoint'
  | 'MobileUnit'
  | 'Other';

export type DemandPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type SyncLogLevel = 'info' | 'warning' | 'error';

export interface LocalEntityBase {
  localId?: number;
  clientOperationId: string;
  sourceDeviceId: string;
  operatorAlias?: string | null;
  createdAtLocal: string;
  updatedAtLocal: string;
  syncStatus: LocalSyncStatus;
  lastSyncError?: string | null;
}

export interface LocalReliefLocation extends LocalEntityBase {
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
}

export interface LocalSupplyItem extends LocalEntityBase {
  locationClientOperationId: string;
  medicineName: string;
  medicineCode?: string | null;
  quantity: number;
  unit: string;
  expiresOn?: string | null;
  batchNumber?: string | null;
  notes?: string | null;
}

export interface LocalDemandItem extends LocalEntityBase {
  locationClientOperationId: string;
  medicineName: string;
  medicineCode?: string | null;
  requestedQuantity: number;
  unit: string;
  priority: DemandPriority;
  patientGroup?: string | null;
  notes?: string | null;
}

export interface LocalSyncBatch {
  localId?: number;
  clientBatchId: string;
  deviceId: string;
  operatorAlias?: string | null;
  status: LocalSyncStatus;
  totalLocations: number;
  totalSupplies: number;
  totalDemands: number;
  createdAtLocal: string;
  updatedAtLocal: string;
  sentAtUtc?: string | null;
  completedAtUtc?: string | null;
  lastError?: string | null;
}

export interface LocalSyncLog {
  localId?: number;
  level: SyncLogLevel;
  message: string;
  createdAtLocal: string;
  metadataJson?: string | null;
}

export interface OfflineCounts {
  pendingLocations: number;
  pendingSupplies: number;
  pendingDemands: number;
  failedLocations: number;
  failedSupplies: number;
  failedDemands: number;
  syncingLocations: number;
  syncingSupplies: number;
  syncingDemands: number;
  syncedLocations: number;
  syncedSupplies: number;
  syncedDemands: number;
  totalLocations: number;
  totalSupplies: number;
  totalDemands: number;
}

export interface OfflineSyncBatchRequest {
  clientBatchId: string;
  deviceId: string;
  operatorAlias?: string | null;
  sentAtUtc: string;
  locations: ReliefLocationSyncItem[];
  supplies: SupplyItemSyncItem[];
  demands: DemandItemSyncItem[];
}

export interface ReliefLocationSyncItem {
  clientOperationId: string;
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
  createdAtLocal: string;
}

export interface SupplyItemSyncItem {
  clientOperationId: string;
  locationClientOperationId: string;
  medicineName: string;
  medicineCode?: string | null;
  quantity: number;
  unit: string;
  expiresOn?: string | null;
  batchNumber?: string | null;
  notes?: string | null;
  createdAtLocal: string;
}

export interface DemandItemSyncItem {
  clientOperationId: string;
  locationClientOperationId: string;
  medicineName?: string;
  medicineCode?: string | null;
  requestedQuantity: number;
  unit: string;
  priority: DemandPriority;
  patientGroup?: string | null;
  notes?: string | null;
  createdAtLocal: string;
}

export interface OfflineSyncBatchResponse {
  clientBatchId: string;
  status: string;
  alreadyProcessed: boolean;
  totalLocations: number;
  totalSupplies: number;
  totalDemands: number;
  acceptedLocations: number;
  acceptedSupplies: number;
  acceptedDemands: number;
  duplicateItems: number;
  rejectedItems: number;
  serverReceivedAtUtc: string;
  warnings: string[];
  rejections: RejectedSyncItemDto[];
}

export interface RejectedSyncItemDto {
  itemType?: string;
  entityType?: string;
  clientOperationId?: string | null;
  reason?: string;
  reasonCode?: string;
  message?: string;
}

export type SyncRunStatus =
  | 'idle'
  | 'skipped'
  | 'success'
  | 'partial'
  | 'failed';

export interface SyncRunResult {
  status: SyncRunStatus;
  message: string;
  clientBatchId?: string;
  totalLocations: number;
  totalSupplies: number;
  totalDemands: number;
  acceptedLocations: number;
  acceptedSupplies: number;
  acceptedDemands: number;
  rejectedItems: number;
  duplicateItems: number;
}