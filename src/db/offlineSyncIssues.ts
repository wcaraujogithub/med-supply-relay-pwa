/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */
import { localDb } from './localDb';
import type {
  SyncIssueLogItem,
  SyncIssueLogKind,
  SyncIssueQueueItem,
  SyncIssueSnapshot,
  SyncQueueKind
} from '../features/sync/syncIssueTypes';

export const SYNC_ISSUES_UPDATED_EVENT = 'msr:sync-issues-updated';

type LocalQueueRecord = {
  localId?: number;
  clientOperationId: string;
  locationClientOperationId?: string | null;
  syncStatus?: string;
  name?: string;
  medicineName?: string;
  type?: string;
  area?: string | null;
  unit?: string | null;
  quantity?: number | null;
  requestedQuantity?: number | null;
  lastSyncError?: string | null;
  updatedAtLocal?: string | null;
  createdAtLocal?: string | null;
};

type LocalSyncLogRecord = {
  localId?: number;
  level?: string;
  message?: string;
  createdAtLocal?: string;
  metadataJson?: string | null;
};

type ApiSyncRejection = {
  itemType?: string | null;
  type?: string | null;
  entity?: string | null;
  clientOperationId?: string | null;
  code?: string | null;
  message?: string | null;
};

type ApiSyncResponse = {
  status?: string;
  alreadyProcessed?: boolean;
  duplicateItems?: number;
  duplicatedItems?: number;
  rejectedItems?: number;
  warnings?: string[];
  rejections?: ApiSyncRejection[];
};

type QueueTable = {
  where(indexName: string): {
    equals(value: string): {
      toArray(): Promise<LocalQueueRecord[]>;
      count(): Promise<number>;
    };
  };
  bulkPut(items: LocalQueueRecord[]): Promise<unknown>;
  bulkDelete(keys: number[]): Promise<unknown>;
};

function getTableByKind(kind: SyncQueueKind): QueueTable {
  switch (kind) {
    case 'location':
      return localDb.reliefLocations as unknown as QueueTable;

    case 'supply':
      return localDb.supplyItems as unknown as QueueTable;

    case 'demand':
      return localDb.demandItems as unknown as QueueTable;
  }
}

// function notifyUpdated(): void {
//   window.dispatchEvent(new CustomEvent(SYNC_ISSUES_UPDATED_EVENT));
// }

function notifyUpdated(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(SYNC_ISSUES_UPDATED_EVENT));
}

function normalizeKind(value?: string | null): SyncQueueKind | null {
  const normalized = String(value ?? '').trim().toLowerCase();

  if (
    normalized === 'location' ||
    normalized === 'relieflocation' ||
    normalized === 'relief_location' ||
    normalized === 'relief-locations'
  ) {
    return 'location';
  }

  if (
    normalized === 'supply' ||
    normalized === 'supplyitem' ||
    normalized === 'supply_item' ||
    normalized === 'supplies'
  ) {
    return 'supply';
  }

  if (
    normalized === 'demand' ||
    normalized === 'demanditem' ||
    normalized === 'demand_item' ||
    normalized === 'demands'
  ) {
    return 'demand';
  }

  return null;
}

function titleFor(kind: SyncQueueKind, item: LocalQueueRecord): string {
  if (kind === 'location') {
    return item.name?.trim() || item.clientOperationId;
  }

  return item.medicineName?.trim() || item.clientOperationId;
}

function subtitleFor(kind: SyncQueueKind, item: LocalQueueRecord): string {
  if (kind === 'location') {
    return [item.type, item.area].filter(Boolean).join(' • ') || '-';
  }

  const quantity =
    kind === 'demand'
      ? item.requestedQuantity
      : item.quantity;

  return [
    quantity ? String(quantity) : null,
    item.unit,
    item.locationClientOperationId
  ]
    .filter(Boolean)
    .join(' • ') || '-';
}

function toQueueItem(
  kind: SyncQueueKind,
  item: LocalQueueRecord
): SyncIssueQueueItem {
  return {
    kind,
    clientOperationId: item.clientOperationId,
    title: titleFor(kind, item),
    subtitle: subtitleFor(kind, item),
    status: item.syncStatus ?? 'Pending',
    error: item.lastSyncError ?? null,
    updatedAtLocal: item.updatedAtLocal ?? item.createdAtLocal ?? null
  };
}

// function detectLogKind(log: LocalSyncLogRecord): SyncIssueLogKind {
//   const text = `${log.level ?? ''} ${log.message ?? ''} ${log.metadataJson ?? ''}`
//     .toLowerCase();

//   if (
//     text.includes('duplicate') ||
//     text.includes('duplicidade') ||
//     text.includes('duplicidad') ||
//     text.includes('already processed')
//   ) {
//     return 'duplicate';
//   }

//   if (
//     text.includes('reject') ||
//     text.includes('rejei') ||
//     text.includes('rechaz')
//   ) {
//     return 'rejected';
//   }

//   if (
//     text.includes('fail') ||
//     text.includes('falha') ||
//     text.includes('error')
//   ) {
//     return 'failed';
//   }

//   if (
//     text.includes('warn') ||
//     text.includes('aviso') ||
//     text.includes('advert')
//   ) {
//     return 'warning';
//   }

//   return 'info';
// }
function detectLogKind(log: LocalSyncLogRecord): SyncIssueLogKind {
  const level = String(log.level ?? '').trim().toLowerCase();
  const message = String(log.message ?? '').trim().toLowerCase();

  const metadata = parseMetadata(log.metadataJson);

  const rejectedItems = Number(metadata?.rejectedItems ?? 0) || 0;
  const duplicateItems =
    Number(metadata?.duplicateItems ?? metadata?.duplicatedItems ?? 0) || 0;

  const rejections = Array.isArray(metadata?.rejections)
    ? metadata.rejections
    : [];

  const warnings = Array.isArray(metadata?.warnings)
    ? metadata.warnings
    : [];

  if (rejectedItems > 0 || rejections.length > 0) {
    return 'rejected';
  }

  if (duplicateItems > 0 || metadata?.alreadyProcessed === true) {
    return 'duplicate';
  }

  if (warnings.length > 0) {
    return 'warning';
  }

  if (
    level === 'error' ||
    message.includes('falha') ||
    message.includes('failed') ||
    message.includes('erro') ||
    message.includes('error')
  ) {
    return 'failed';
  }

  if (
    level === 'warning' ||
    message.includes('aviso') ||
    message.includes('warning') ||
    message.includes('advertencia')
  ) {
    return 'warning';
  }

  if (
    message.includes('duplicidade') ||
    message.includes('duplicidad') ||
    message.includes('duplicate') ||
    message.includes('already processed')
  ) {
    return 'duplicate';
  }

  if (
    message.includes('rejeitado') ||
    message.includes('rejeição') ||
    message.includes('rejeicao') ||
    message.includes('rechazado') ||
    message.includes('rechazo') ||
    message.includes('rejected')
  ) {
    return 'rejected';
  }

  return 'info';
}

function parseMetadata(metadataJson?: string | null): Record<string, unknown> | null {
  if (!metadataJson) {
    return null;
  }

  try {
    const parsed = JSON.parse(metadataJson);

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


function normalizeLog(log: LocalSyncLogRecord): SyncIssueLogItem {
  const level = log.level ?? 'info';
  const message = log.message ?? '-';
  const createdAtLocal = log.createdAtLocal ?? new Date().toISOString();

  return {
    localId: log.localId,
    kind: detectLogKind(log),
    level,
    message,
    createdAtLocal,
    metadataJson: log.metadataJson ?? null
  };
}

async function countStatus(status: string): Promise<number> {
  const [locations, supplies, demands] = await Promise.all([
    localDb.reliefLocations.where('syncStatus').equals(status).count(),
    localDb.supplyItems.where('syncStatus').equals(status).count(),
    localDb.demandItems.where('syncStatus').equals(status).count()
  ]);

  return locations + supplies + demands;
}

async function getFailedItems(): Promise<SyncIssueQueueItem[]> {
  const [locations, supplies, demands] = await Promise.all([
    localDb.reliefLocations.where('syncStatus').equals('Failed').toArray(),
    localDb.supplyItems.where('syncStatus').equals('Failed').toArray(),
    localDb.demandItems.where('syncStatus').equals('Failed').toArray()
  ]);

  return [
    ...locations.map((item) => toQueueItem('location', item as LocalQueueRecord)),
    ...supplies.map((item) => toQueueItem('supply', item as LocalQueueRecord)),
    ...demands.map((item) => toQueueItem('demand', item as LocalQueueRecord))
  ].sort((a, b) =>
    String(b.updatedAtLocal ?? '').localeCompare(String(a.updatedAtLocal ?? ''))
  );
}

async function getRecentLogs(): Promise<SyncIssueLogItem[]> {
  const logs = (await localDb.syncLogs.toArray()) as LocalSyncLogRecord[];

  return logs
    .map(normalizeLog)
    .filter((log) => log.kind !== 'info')
    .sort((a, b) => b.createdAtLocal.localeCompare(a.createdAtLocal))
    .slice(0, 40);
}

export async function getOfflineSyncIssueSnapshot(): Promise<SyncIssueSnapshot> {
  const [
    pendingTotal,
    syncingTotal,
    syncedTotal,
    failedTotal,
    failedItems,
    logs
  ] = await Promise.all([
    countStatus('Pending'),
    countStatus('Syncing'),
    countStatus('Synced'),
    countStatus('Failed'),
    getFailedItems(),
    getRecentLogs()
  ]);

  return {
    generatedAtLocal: new Date().toISOString(),
    pendingTotal,
    syncingTotal,
    syncedTotal,
    failedTotal,
    rejectedTotal: logs.filter((log) => log.kind === 'rejected').length,
    duplicateTotal: logs.filter((log) => log.kind === 'duplicate').length,
    warningTotal: logs.filter((log) => log.kind === 'warning').length,
    failedItems,
    logs
  };
}

export async function retryAllFailedQueueItems(): Promise<number> {
  const now = new Date().toISOString();

  const kinds: SyncQueueKind[] = ['location', 'supply', 'demand'];
  let total = 0;

  for (const kind of kinds) {
    const table = getTableByKind(kind);
    const items = (await table
      .where('syncStatus')
      .equals('Failed')
      .toArray()) as LocalQueueRecord[];

    if (items.length === 0) {
      continue;
    }

    // const updated = items.map((item) => ({
    //   ...item,
    //   syncStatus: 'Pending',
    //   lastSyncError: null,
    //   updatedAtLocal: now
    // }));
    const updated: LocalQueueRecord[] = items.map((item) => ({
  ...item,
  syncStatus: 'Pending',
  lastSyncError: null,
  updatedAtLocal: now
}));


    await table.bulkPut(updated);
    total += updated.length;
  }

  notifyUpdated();
  return total;
}

export async function retrySingleQueueItem(
  kind: SyncQueueKind,
  clientOperationId: string
): Promise<void> {
  const table = getTableByKind(kind);
  const now = new Date().toISOString();

  const items = (await table
    .where('clientOperationId')
    .equals(clientOperationId)
    .toArray()) as LocalQueueRecord[];

  if (items.length === 0) {
    return;
  }

  // await table.bulkPut(
  //   items.map((item) => ({
  //     ...item,
  //     syncStatus: 'Pending',
  //     lastSyncError: null,
  //     updatedAtLocal: now
  //   }))
  // );

  const updated: LocalQueueRecord[] = items.map((item) => ({
  ...item,
  syncStatus: 'Pending',
  lastSyncError: null,
  updatedAtLocal: now
}));

await table.bulkPut(updated);
  notifyUpdated();
}

export async function discardLocalQueueItem(
  kind: SyncQueueKind,
  clientOperationId: string
): Promise<void> {
  const table = getTableByKind(kind);

  const items = (await table
    .where('clientOperationId')
    .equals(clientOperationId)
    .toArray()) as LocalQueueRecord[];

  if (items.length === 0) {
    return;
  }

  const primaryKeys = items
    .map((item) => item.localId)
    .filter((value): value is number => typeof value === 'number');

  if (primaryKeys.length > 0) {
    await table.bulkDelete(primaryKeys);
  }

  notifyUpdated();
}

export async function clearLocalSyncIssueLogs(): Promise<void> {
  await localDb.syncLogs.clear();
  notifyUpdated();
}

async function addSyncLog(
  level: 'info' | 'warning' | 'error',
  message: string,
  metadata?: unknown
): Promise<void> {
  await localDb.syncLogs.add({
    level,
    message,
    metadataJson: metadata ? JSON.stringify(metadata) : null,
    createdAtLocal: new Date().toISOString()
  });
}

async function markRejectedItemAsFailed(rejection: ApiSyncRejection): Promise<void> {
  const kind = normalizeKind(
    rejection.itemType ?? rejection.type ?? rejection.entity
  );

  const clientOperationId = rejection.clientOperationId?.trim();

  if (!kind || !clientOperationId) {
    return;
  }

  const table = getTableByKind(kind);
  const items = (await table
    .where('clientOperationId')
    .equals(clientOperationId)
    .toArray()) as LocalQueueRecord[];

  if (items.length === 0) {
    return;
  }

  const now = new Date().toISOString();

  // await table.bulkPut(
  //   items.map((item) => ({
  //     ...item,
  //     syncStatus: 'Failed',
  //     lastSyncError:
  //       rejection.message ??
  //       rejection.code ??
  //       'Rejected by sync API.',
  //     updatedAtLocal: now
  //   }))
  // );
const updated: LocalQueueRecord[] = items.map((item) => ({
  ...item,
  syncStatus: 'Failed',
  lastSyncError:
    rejection.message ??
    rejection.code ??
    'Rejected by sync API.',
  updatedAtLocal: now
}));

await table.bulkPut(updated);

}

export async function recordSyncResponseIssues(

  response: ApiSyncResponse
): Promise<void> {
  const warnings = Array.isArray(response.warnings) ? response.warnings : [];
  const rejections = Array.isArray(response.rejections) ? response.rejections : [];

  const duplicateItems =
    Number(response.duplicateItems ?? response.duplicatedItems ?? 0) || 0;

  const rejectedItems = Number(response.rejectedItems ?? rejections.length) || 0;

  if (response.alreadyProcessed) {
    await addSyncLog(
      'warning',
      'Sync batch already processed by server.',
      response
    );
  }

  if (duplicateItems > 0) {
    await addSyncLog(
      'warning',
      `${duplicateItems} duplicate item(s) reported by server.`,
      response
    );
  }

  if (warnings.length > 0) {
    for (const warning of warnings) {
      await addSyncLog('warning', warning, response);
    }
  }

  if (rejectedItems > 0 && rejections.length === 0) {
    await addSyncLog(
      'error',
      `${rejectedItems} rejected item(s) reported by server.`,
      response
    );
  }

  for (const rejection of rejections) {
    await addSyncLog(
      'error',
      rejection.message ?? rejection.code ?? 'Item rejected by sync API.',
      rejection
    );

    await markRejectedItemAsFailed(rejection);
  }

  notifyUpdated();
}




// import { localDb } from './localDb';
// import type {
//   SyncIssueLogItem,
//   SyncIssueLogKind,
//   SyncIssueQueueItem,
//   SyncIssueSnapshot,
//   SyncQueueKind
// } from '../features/sync/syncIssueTypes';

// export const SYNC_ISSUES_UPDATED_EVENT = 'msr:sync-issues-updated';

// type LocalQueueRecord = {
//   localId?: number;
//   clientOperationId: string;
//   locationClientOperationId?: string | null;
//   syncStatus?: string;
//   name?: string;
//   medicineName?: string;
//   type?: string;
//   area?: string | null;
//   unit?: string | null;
//   quantity?: number | null;
//   requestedQuantity?: number | null;
//   lastSyncError?: string | null;
//   updatedAtLocal?: string | null;
//   createdAtLocal?: string | null;
// };

// type LocalSyncLogRecord = {
//   localId?: number;
//   level?: string;
//   message?: string;
//   createdAtLocal?: string;
//   metadataJson?: string | null;
// };

// type ApiSyncRejection = {
//   itemType?: string | null;
//   type?: string | null;
//   entity?: string | null;
//   clientOperationId?: string | null;
//   code?: string | null;
//   message?: string | null;
// };

// type ApiSyncResponse = {
//   status?: string;
//   alreadyProcessed?: boolean;
//   duplicateItems?: number;
//   duplicatedItems?: number;
//   rejectedItems?: number;
//   warnings?: string[];
//   rejections?: ApiSyncRejection[];
// };

// type QueueTable = {
//   where(indexName: string): {
//     equals(value: string): {
//       toArray(): Promise<LocalQueueRecord[]>;
//       count(): Promise<number>;
//     };
//   };
//   bulkPut(items: LocalQueueRecord[]): Promise<unknown>;
//   bulkDelete(keys: number[]): Promise<unknown>;
// };

// function getTableByKind(kind: SyncQueueKind): QueueTable {
//   switch (kind) {
//     case 'location':
//       return localDb.reliefLocations as unknown as QueueTable;

//     case 'supply':
//       return localDb.supplyItems as unknown as QueueTable;

//     case 'demand':
//       return localDb.demandItems as unknown as QueueTable;
//   }
// }

// function notifyUpdated(): void {
//   window.dispatchEvent(new CustomEvent(SYNC_ISSUES_UPDATED_EVENT));
// }

// function normalizeKind(value?: string | null): SyncQueueKind | null {
//   const normalized = String(value ?? '').trim().toLowerCase();

//   if (
//     normalized === 'location' ||
//     normalized === 'relieflocation' ||
//     normalized === 'relief_location' ||
//     normalized === 'relief-location' ||
//     normalized === 'relief_locations' ||
//     normalized === 'relief-locations'
//   ) {
//     return 'location';
//   }

//   if (
//     normalized === 'supply' ||
//     normalized === 'supplyitem' ||
//     normalized === 'supply_item' ||
//     normalized === 'supply-item' ||
//     normalized === 'supplies'
//   ) {
//     return 'supply';
//   }

//   if (
//     normalized === 'demand' ||
//     normalized === 'demanditem' ||
//     normalized === 'demand_item' ||
//     normalized === 'demand-item' ||
//     normalized === 'demands'
//   ) {
//     return 'demand';
//   }

//   return null;
// }

// function titleFor(kind: SyncQueueKind, item: LocalQueueRecord): string {
//   if (kind === 'location') {
//     return item.name?.trim() || item.clientOperationId;
//   }

//   return item.medicineName?.trim() || item.clientOperationId;
// }

// function subtitleFor(kind: SyncQueueKind, item: LocalQueueRecord): string {
//   if (kind === 'location') {
//     return [item.type, item.area].filter(Boolean).join(' • ') || '-';
//   }

//   const quantity =
//     kind === 'demand'
//       ? item.requestedQuantity
//       : item.quantity;

//   return [
//     quantity ? String(quantity) : null,
//     item.unit,
//     item.locationClientOperationId
//   ]
//     .filter(Boolean)
//     .join(' • ') || '-';
// }

// function toQueueItem(
//   kind: SyncQueueKind,
//   item: LocalQueueRecord
// ): SyncIssueQueueItem {
//   return {
//     kind,
//     clientOperationId: item.clientOperationId,
//     title: titleFor(kind, item),
//     subtitle: subtitleFor(kind, item),
//     status: item.syncStatus ?? 'Pending',
//     error: item.lastSyncError ?? null,
//     updatedAtLocal: item.updatedAtLocal ?? item.createdAtLocal ?? null
//   };
// }

// function detectLogKind(log: LocalSyncLogRecord): SyncIssueLogKind {
//   const text = `${log.level ?? ''} ${log.message ?? ''} ${log.metadataJson ?? ''}`
//     .toLowerCase();

//   if (
//     text.includes('duplicate') ||
//     text.includes('duplicidade') ||
//     text.includes('duplicidad') ||
//     text.includes('already processed')
//   ) {
//     return 'duplicate';
//   }

//   if (
//     text.includes('reject') ||
//     text.includes('rejei') ||
//     text.includes('rechaz')
//   ) {
//     return 'rejected';
//   }

//   if (
//     text.includes('fail') ||
//     text.includes('falha') ||
//     text.includes('error')
//   ) {
//     return 'failed';
//   }

//   if (
//     text.includes('warn') ||
//     text.includes('aviso') ||
//     text.includes('advert')
//   ) {
//     return 'warning';
//   }

//   return 'info';
// }

// function normalizeLog(log: LocalSyncLogRecord): SyncIssueLogItem {
//   const level = log.level ?? 'info';
//   const message = log.message ?? '-';
//   const createdAtLocal = log.createdAtLocal ?? new Date().toISOString();

//   return {
//     localId: log.localId,
//     kind: detectLogKind(log),
//     level,
//     message,
//     createdAtLocal,
//     metadataJson: log.metadataJson ?? null
//   };
// }

// async function countStatusByKind(
//   kind: SyncQueueKind,
//   status: string
// ): Promise<number> {
//   const table = getTableByKind(kind);

//   return table
//     .where('syncStatus')
//     .equals(status)
//     .count();
// }

// async function countStatus(status: string): Promise<number> {
//   const [locations, supplies, demands] = await Promise.all([
//     countStatusByKind('location', status),
//     countStatusByKind('supply', status),
//     countStatusByKind('demand', status)
//   ]);

//   return locations + supplies + demands;
// }

// async function getFailedItemsByKind(
//   kind: SyncQueueKind
// ): Promise<SyncIssueQueueItem[]> {
//   const table = getTableByKind(kind);

//   const items = await table
//     .where('syncStatus')
//     .equals('Failed')
//     .toArray();

//   return items.map((item) => toQueueItem(kind, item));
// }

// async function getFailedItems(): Promise<SyncIssueQueueItem[]> {
//   const [locations, supplies, demands] = await Promise.all([
//     getFailedItemsByKind('location'),
//     getFailedItemsByKind('supply'),
//     getFailedItemsByKind('demand')
//   ]);

//   return [...locations, ...supplies, ...demands].sort((a, b) =>
//     String(b.updatedAtLocal ?? '').localeCompare(String(a.updatedAtLocal ?? ''))
//   );
// }

// async function getRecentLogs(): Promise<SyncIssueLogItem[]> {
//   const logs = (await localDb.syncLogs.toArray()) as LocalSyncLogRecord[];

//   return logs
//     .map(normalizeLog)
//     .filter((log) => log.kind !== 'info')
//     .sort((a, b) => b.createdAtLocal.localeCompare(a.createdAtLocal))
//     .slice(0, 40);
// }

// export async function getOfflineSyncIssueSnapshot(): Promise<SyncIssueSnapshot> {
//   const [
//     pendingTotal,
//     syncingTotal,
//     syncedTotal,
//     failedTotal,
//     failedItems,
//     logs
//   ] = await Promise.all([
//     countStatus('Pending'),
//     countStatus('Syncing'),
//     countStatus('Synced'),
//     countStatus('Failed'),
//     getFailedItems(),
//     getRecentLogs()
//   ]);

//   return {
//     generatedAtLocal: new Date().toISOString(),
//     pendingTotal,
//     syncingTotal,
//     syncedTotal,
//     failedTotal,
//     rejectedTotal: logs.filter((log) => log.kind === 'rejected').length,
//     duplicateTotal: logs.filter((log) => log.kind === 'duplicate').length,
//     warningTotal: logs.filter((log) => log.kind === 'warning').length,
//     failedItems,
//     logs
//   };
// }

// export async function retryAllFailedQueueItems(): Promise<number> {
//   const now = new Date().toISOString();
//   const kinds: SyncQueueKind[] = ['location', 'supply', 'demand'];

//   let total = 0;

//   for (const kind of kinds) {
//     const table = getTableByKind(kind);

//     const items = await table
//       .where('syncStatus')
//       .equals('Failed')
//       .toArray();

//     if (items.length === 0) {
//       continue;
//     }

//     const updated: LocalQueueRecord[] = items.map((item) => ({
//       ...item,
//       syncStatus: 'Pending',
//       lastSyncError: null,
//       updatedAtLocal: now
//     }));

//     await table.bulkPut(updated);
//     total += updated.length;
//   }

//   notifyUpdated();

//   return total;
// }

// export async function retrySingleQueueItem(
//   kind: SyncQueueKind,
//   clientOperationId: string
// ): Promise<void> {
//   const table = getTableByKind(kind);
//   const now = new Date().toISOString();

//   const items = await table
//     .where('clientOperationId')
//     .equals(clientOperationId)
//     .toArray();

//   if (items.length === 0) {
//     return;
//   }

//   const updated: LocalQueueRecord[] = items.map((item) => ({
//     ...item,
//     syncStatus: 'Pending',
//     lastSyncError: null,
//     updatedAtLocal: now
//   }));

//   await table.bulkPut(updated);

//   notifyUpdated();
// }

// export async function discardLocalQueueItem(
//   kind: SyncQueueKind,
//   clientOperationId: string
// ): Promise<void> {
//   const table = getTableByKind(kind);

//   const items = await table
//     .where('clientOperationId')
//     .equals(clientOperationId)
//     .toArray();

//   if (items.length === 0) {
//     return;
//   }

//   const primaryKeys = items
//     .map((item) => item.localId)
//     .filter((value): value is number => typeof value === 'number');

//   if (primaryKeys.length > 0) {
//     await table.bulkDelete(primaryKeys);
//   }

//   notifyUpdated();
// }

// export async function clearLocalSyncIssueLogs(): Promise<void> {
//   await localDb.syncLogs.clear();

//   notifyUpdated();
// }

// async function addSyncLog(
//   level: 'info' | 'warning' | 'error',
//   message: string,
//   metadata?: unknown
// ): Promise<void> {
//   await localDb.syncLogs.add({
//     level,
//     message,
//     metadataJson: metadata ? JSON.stringify(metadata) : null,
//     createdAtLocal: new Date().toISOString()
//   });

//   notifyUpdated();
// }

// async function markRejectedItemAsFailed(
//   rejection: ApiSyncRejection
// ): Promise<void> {
//   const kind = normalizeKind(
//     rejection.itemType ?? rejection.type ?? rejection.entity
//   );

//   const clientOperationId = rejection.clientOperationId?.trim();

//   if (!kind || !clientOperationId) {
//     return;
//   }

//   const table = getTableByKind(kind);

//   const items = await table
//     .where('clientOperationId')
//     .equals(clientOperationId)
//     .toArray();

//   if (items.length === 0) {
//     return;
//   }

//   const now = new Date().toISOString();

//   const updated: LocalQueueRecord[] = items.map((item) => ({
//     ...item,
//     syncStatus: 'Failed',
//     lastSyncError:
//       rejection.message ??
//       rejection.code ??
//       'Rejected by sync API.',
//     updatedAtLocal: now
//   }));

//   await table.bulkPut(updated);

//   notifyUpdated();
// }

// export async function recordSyncResponseIssues(
//   response: ApiSyncResponse
// ): Promise<void> {
//   const warnings = Array.isArray(response.warnings)
//     ? response.warnings
//     : [];

//   const rejections = Array.isArray(response.rejections)
//     ? response.rejections
//     : [];

//   const duplicateItems =
//     Number(response.duplicateItems ?? response.duplicatedItems ?? 0) || 0;

//   const rejectedItems =
//     Number(response.rejectedItems ?? rejections.length) || 0;

//   if (response.alreadyProcessed) {
//     await addSyncLog(
//       'warning',
//       'Sync batch already processed by server.',
//       response
//     );
//   }

//   if (duplicateItems > 0) {
//     await addSyncLog(
//       'warning',
//       `${duplicateItems} duplicate item(s) reported by server.`,
//       response
//     );
//   }

//   if (warnings.length > 0) {
//     for (const warning of warnings) {
//       await addSyncLog('warning', warning, response);
//     }
//   }

//   if (rejectedItems > 0 && rejections.length === 0) {
//     await addSyncLog(
//       'error',
//       `${rejectedItems} rejected item(s) reported by server.`,
//       response
//     );
//   }

//   for (const rejection of rejections) {
//     await addSyncLog(
//       'error',
//       rejection.message ?? rejection.code ?? 'Item rejected by sync API.',
//       rejection
//     );

//     await markRejectedItemAsFailed(rejection);
//   }

//   notifyUpdated();
// }