// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Wesley Cordeiro de Araujo
// See NOTICE for additional attribution and origin notices.

import { localDb } from './localDb';
import type {
  SyncIssueLogItem,
  SyncIssueLogKind,
  SyncIssueQueueItem,
  SyncIssueSnapshot,
  SyncQueueKind
} from '../features/sync/syncIssueTypes';

export const SYNC_ISSUES_UPDATED_EVENT =
  'msr:sync-issues-updated';

const MAX_STORED_SYNC_LOGS = 25;

const MAX_VISIBLE_RECENT_LOGS = 25;

const FAILURE_DEDUP_WINDOW_MS =
  15 * 60 * 1000;

  const DB_SYNC_STATUS = {
  pending: 'pending',
  syncing: 'syncing',
  synced: 'synced',
  failed: 'failed'
} as const;

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
  toArray(): Promise<LocalQueueRecord[]>;

  where(indexName: string): {
    equals(value: string): {
      toArray(): Promise<LocalQueueRecord[]>;
    };
  };

  bulkPut(
    items: LocalQueueRecord[]
  ): Promise<unknown>;

  bulkDelete(
    keys: number[]
  ): Promise<unknown>;
};

function getTableByKind(
  kind: SyncQueueKind
): QueueTable {
  switch (kind) {
    case 'location':    
    return (
        localDb.reliefLocations as unknown as QueueTable
      );

    case 'supply':
          return (
        localDb.supplyItems as unknown as QueueTable
      );

    case 'demand':
        return (
        localDb.demandItems as unknown as QueueTable
      );
  }
}

function notifyUpdated(): void {
  if (
    typeof window === 'undefined'
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      SYNC_ISSUES_UPDATED_EVENT
    )
  );
}

function normalizeKind(
  value?: string | null
): SyncQueueKind | null {
  const normalized =
    String(value ?? '')
      .trim()
      .toLowerCase();

  if (
    normalized === 'location' ||
    normalized === 'relieflocation' ||
    normalized === 'relief_location' ||
    normalized === 'relief-location' ||
    normalized === 'relief_locations' ||
    normalized === 'relief-locations'
  ) {
    return 'location';
  }

  if (
    normalized === 'supply' ||
    normalized === 'supplyitem' ||
    normalized === 'supply_item' ||
    normalized === 'supply-item' ||
    normalized === 'supplies'
  ) {
    return 'supply';
  }

  if (
    normalized === 'demand' ||
    normalized === 'demanditem' ||
    normalized === 'demand_item' ||
    normalized === 'demand-item' ||
    normalized === 'demands'
  ) {
    return 'demand';
  }

  return null;
}

function normalizeQueueStatus(
  value?: string | null
): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function canonicalQueueStatus(
  value?: string | null
): string {
  switch (
    normalizeQueueStatus(value)
  ) {
    case 'pending':
      return 'Pending';

    case 'syncing':
      return 'Syncing';

    case 'synced':
      return 'Synced';

    case 'failed':
      return 'Failed';

    default:
      return value?.trim() || 'Pending';
  }
}

async function getQueueItemsByStatus(
  kind: SyncQueueKind,
  status: string
): Promise<LocalQueueRecord[]> {
  const expectedStatus =
    normalizeQueueStatus(status);

  const items =
    await getTableByKind(kind)
      .toArray();

  return items.filter(
    (item) =>
      normalizeQueueStatus(
        item.syncStatus
      ) === expectedStatus
  );
}

function titleFor(
  kind: SyncQueueKind,
  item: LocalQueueRecord
): string {
  if (kind === 'location') {
    return (
      item.name?.trim() ||
      item.clientOperationId
    );
  }

  return (
    item.medicineName?.trim() ||
    item.clientOperationId
  );
}

function subtitleFor(
  kind: SyncQueueKind,
  item: LocalQueueRecord
): string {
  if (kind === 'location') {
    return [
      item.type,
      item.area
    ]
      .filter(Boolean)
      .join(' • ') || '-';
  }

  const quantity =
    kind === 'demand'
      ? item.requestedQuantity
      : item.quantity;

  return [
    quantity !== null &&
    quantity !== undefined
      ? String(quantity)
      : null,
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
    clientOperationId:
      item.clientOperationId,
    title:
      titleFor(kind, item),
    subtitle:
      subtitleFor(kind, item),
    status:
      canonicalQueueStatus(
        item.syncStatus
      ),
    error:
      item.lastSyncError ?? null,
    updatedAtLocal:
      item.updatedAtLocal ??
      item.createdAtLocal ??
      null
  };
}

function toRecord(
  value: unknown
): Record<string, unknown> | null {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as Record<
    string,
    unknown
  >;
}

function parseMetadata(
  metadataJson?: string | null
): Record<string, unknown> | null {
  if (!metadataJson) {
    return null;
  }

  try {
    return toRecord(
      JSON.parse(metadataJson)
    );
  } catch {
    return null;
  }
}

function detectLogKind(
  log: LocalSyncLogRecord
): SyncIssueLogKind {
  const level =
    String(log.level ?? '')
      .trim()
      .toLowerCase();

  const message =
    String(log.message ?? '')
      .trim()
      .toLowerCase();

  const metadata =
    parseMetadata(log.metadataJson);

  const status =
    String(metadata?.status ?? '')
      .trim()
      .toLowerCase();

  const failureType =
    String(
      metadata?.failureType ?? ''
    )
      .trim()
      .toLowerCase();

  const httpStatus =
    Number(
      metadata?.httpStatus ?? 0
    ) || 0;

  const rejections =
    Array.isArray(metadata?.rejections)
      ? metadata.rejections
      : [];

  const rejectedItems =
    Number(
      metadata?.rejectedItems ?? 0
    ) || 0;

  const duplicateItems =
    Number(
      metadata?.duplicateItems ??
      metadata?.duplicatedItems ??
      0
    ) || 0;

  const warnings =
    Array.isArray(metadata?.warnings)
      ? metadata.warnings
      : [];

  const clientOperationId =
    String(
      metadata?.clientOperationId ?? ''
    ).trim();

  const rejectionCode =
    String(
      metadata?.code ?? ''
    ).trim();

  const rejectionEntity =
    String(
      metadata?.itemType ??
      metadata?.entity ??
      metadata?.type ??
      ''
    ).trim();

  /*
   * Infrastructure failure has precedence.
   */
  if (
    failureType === 'http' ||
    failureType === 'network' ||
    failureType === 'api-batch' ||
    httpStatus >= 500
  ) {
    return 'failed';
  }

  /*
   * Structured rejection.
   */
  if (
    rejections.length > 0 ||
    rejectedItems > 0 ||
    (
      clientOperationId.length > 0 &&
      (
        rejectionCode.length > 0 ||
        rejectionEntity.length > 0
      )
    )
  ) {
    return 'rejected';
  }

  if (
    duplicateItems > 0 ||
    metadata?.alreadyProcessed === true
  ) {
    return 'duplicate';
  }

  if (warnings.length > 0) {
    return 'warning';
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

  if (
    message.includes('duplicidade') ||
    message.includes('duplicidad') ||
    message.includes('duplicate') ||
    message.includes(
      'already processed'
    )
  ) {
    return 'duplicate';
  }

  if (
    status === 'failed' ||
    level === 'error' ||
    message.includes('sync failed') ||
    message.includes(
      'falha ao sincronizar'
    ) ||
    message.includes(
      'servidor indisponível'
    ) ||
    message.includes(
      'servidor indisponivel'
    ) ||
    message.includes('network error')
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

  return 'info';
}

function sanitizeVisibleMessage(
  value: string
): string {
  const compact = value
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (compact.length <= 320) {
    return compact;
  }

  return `${compact.slice(
    0,
    317
  )}...`;
}

function sanitizeMetadataJson(
  metadataJson?: string | null
): string | null {
  const metadata =
    parseMetadata(metadataJson);

  if (!metadata) {
    return null;
  }

  const safeMetadata:
    Record<string, unknown> = {};

  const allowedKeys = [
    'failureType',
    'httpStatus',
    'problemType',
    'problemTitle',
    'traceId',
    'status',
    'clientBatchId',
    'syncReason',
    'affectedItems',
    'rejectedItems',
    'duplicateItems',
    'duplicatedItems',
    'alreadyProcessed',
    'clientOperationId',
    'itemType',
    'type',
    'entity',
    'code',
    'message'
  ];

  for (
    const key of allowedKeys
  ) {
    if (
      metadata[key] !== undefined
    ) {
      safeMetadata[key] =
        metadata[key];
    }
  }

  if (
    Array.isArray(
      metadata.rejections
    )
  ) {
    safeMetadata.rejectionsCount =
      metadata.rejections.length;
  }

  if (
    Array.isArray(
      metadata.warnings
    )
  ) {
    safeMetadata.warningsCount =
      metadata.warnings.length;
  }

  if (
    Object.keys(safeMetadata)
      .length === 0
  ) {
    return null;
  }

  return JSON.stringify(
    safeMetadata,
    null,
    2
  );
}

function normalizeLog(
  log: LocalSyncLogRecord
): SyncIssueLogItem {
  return {
    localId: log.localId,
    kind: detectLogKind(log),
    level:
      log.level ?? 'info',
    message:
      sanitizeVisibleMessage(
        log.message ?? '-'
      ),
    createdAtLocal:
      log.createdAtLocal ??
      new Date().toISOString(),
    metadataJson:
      sanitizeMetadataJson(
        log.metadataJson
      )
  };
}

function getRejectedCount(
  log: SyncIssueLogItem
): number {
  if (
    log.kind !== 'rejected'
  ) {
    return 0;
  }

  const metadata =
    parseMetadata(
      log.metadataJson
    );

  const rejectionsCount =
    Number(
      metadata?.rejectionsCount ?? 0
    ) || 0;

  if (rejectionsCount > 0) {
    return rejectionsCount;
  }

  const rejectedItems =
    Number(
      metadata?.rejectedItems ?? 0
    ) || 0;

  if (rejectedItems > 0) {
    return rejectedItems;
  }

  return 1;
}

function getDuplicateCount(
  log: SyncIssueLogItem
): number {
  if (
    log.kind !== 'duplicate'
  ) {
    return 0;
  }

  const metadata =
    parseMetadata(
      log.metadataJson
    );

  const duplicateItems =
    Number(
      metadata?.duplicateItems ??
      metadata?.duplicatedItems ??
      0
    ) || 0;

  return duplicateItems > 0
    ? duplicateItems
    : 1;
}

async function countStatusByKind(
  kind: SyncQueueKind,
  status: string
): Promise<number> {
  const items =
    await getQueueItemsByStatus(
      kind,
      status
    );

  return items.length;
}

async function countStatus(
  status: string
): Promise<number> {
  const [
    locations,
    supplies,
    demands
  ] = await Promise.all([
    countStatusByKind(
      'location',
      status
    ),
    countStatusByKind(
      'supply',
      status
    ),
    countStatusByKind(
      'demand',
      status
    )
  ]);

  return (
    locations +
    supplies +
    demands
  );
}

async function getFailedItemsByKind(
  kind: SyncQueueKind
): Promise<SyncIssueQueueItem[]> {
  const items =
    await getQueueItemsByStatus(
      kind,
      'Failed'
    );

  return items.map(
    (item) =>
      toQueueItem(kind, item)
  );
}

async function getFailedItems():
Promise<SyncIssueQueueItem[]> {
  const [
    locations,
    supplies,
    demands
  ] = await Promise.all([
    getFailedItemsByKind(
      'location'
    ),
    getFailedItemsByKind(
      'supply'
    ),
    getFailedItemsByKind(
      'demand'
    )
  ]);

  return [
    ...locations,
    ...supplies,
    ...demands
  ].sort(
    (a, b) =>
      String(
        b.updatedAtLocal ?? ''
      ).localeCompare(
        String(
          a.updatedAtLocal ?? ''
        )
      )
  );
}

async function pruneSyncLogs():
Promise<void> {
  const logs =
    (await localDb.syncLogs
      .toArray()) as LocalSyncLogRecord[];

  if (
    logs.length <=
    MAX_STORED_SYNC_LOGS
  ) {
    return;
  }

  const ordered = [...logs].sort(
    (a, b) =>
      String(
        b.createdAtLocal ?? ''
      ).localeCompare(
        String(
          a.createdAtLocal ?? ''
        )
      )
  );

  const logsToDelete =
    ordered.slice(
      MAX_STORED_SYNC_LOGS
    );

  const primaryKeys =
    logsToDelete
      .map((log) => log.localId)
      .filter(
        (
          value
        ): value is number =>
          typeof value === 'number'
      );

  if (
    primaryKeys.length > 0
  ) {
    await localDb.syncLogs
      .bulkDelete(primaryKeys);
  }
}

async function getIssueLogs():
Promise<SyncIssueLogItem[]> {
  const logs =
    (await localDb.syncLogs
      .toArray()) as LocalSyncLogRecord[];

  return logs
    .map(normalizeLog)
    .filter(
      (log) =>
        log.kind !== 'info'
    )
    .sort(
      (a, b) =>
        b.createdAtLocal
          .localeCompare(
            a.createdAtLocal
          )
    );
}

export async function getOfflineSyncIssueSnapshot():
Promise<SyncIssueSnapshot> {
  /*
   * Also compacts legacy local logs that may already
   * exist before this hardening patch.
   */
  await pruneSyncLogs();

  const [
    pendingTotal,
    syncingTotal,
    syncedTotal,
    failedTotal,
    failedItems,
    issueLogs
  ] = await Promise.all([
    countStatus('Pending'),
    countStatus('Syncing'),
    countStatus('Synced'),
    countStatus('Failed'),
    getFailedItems(),
    getIssueLogs()
  ]);

  return {
    generatedAtLocal:
      new Date().toISOString(),

    pendingTotal,
    syncingTotal,
    syncedTotal,
    failedTotal,

    rejectedTotal:
      issueLogs.reduce(
        (total, log) =>
          total +
          getRejectedCount(log),
        0
      ),

    duplicateTotal:
      issueLogs.reduce(
        (total, log) =>
          total +
          getDuplicateCount(log),
        0
      ),

    warningTotal:
      issueLogs.filter(
        (log) =>
          log.kind === 'warning'
      ).length,

    failedItems,

    logs: issueLogs.slice(
      0,
      MAX_VISIBLE_RECENT_LOGS
    )
  };
}




function extractHttpStatusFromError(
  value?: string | null
): number | null {
  if (!value) {
    return null;
  }

  const match = value.match(
    /\bHTTP\s+(\d{3})\b/i
  );

  if (!match) {
    return null;
  }

  const status = Number(match[1]);

  return Number.isFinite(status)
    ? status
    : null;
}

function isTransientInfrastructureFailure(
  item: LocalQueueRecord
): boolean {
  const error = String(
    item.lastSyncError ?? ''
  )
    .trim()
    .toLowerCase();

  if (!error) {
    return false;
  }

  const httpStatus =
    extractHttpStatusFromError(
      item.lastSyncError
    );

  if (
    httpStatus === 408 ||
    httpStatus === 429 ||
    (
      httpStatus !== null &&
      httpStatus >= 500
    )
  ) {
    return true;
  }

  const transientSignals = [
    'failed to fetch',
    'networkerror',
    'network error',
    'load failed',
    'connection refused',
    'connection reset',
    'connection timed out',
    'timed out',
    'timeout',
    'temporarily unavailable',
    'servidor indisponível',
    'servidor indisponivel',
    'conexão recusada',
    'conexao recusada',
    'npgsql',
    'postgres exception',
    'postgresexception',
    'retrylimitexceeded',
    'socketexception'
  ];

  return transientSignals.some(
    (signal) =>
      error.includes(signal)
  );
}

export async function requeueTransientFailedQueueItems():
Promise<number> {
  const now =
    new Date().toISOString();

  const kinds: SyncQueueKind[] = [
    'location',
    'supply',
    'demand'
  ];

  let total = 0;

  for (const kind of kinds) {
    const table =
      getTableByKind(kind);

    const failedItems =
      await getQueueItemsByStatus(
        kind,
        DB_SYNC_STATUS.failed
      );

    const transientItems =
      failedItems.filter(
        isTransientInfrastructureFailure
      );

    if (
      transientItems.length === 0
    ) {
      continue;
    }

    const updated:
      LocalQueueRecord[] =
        transientItems.map(
          (item) => ({
            ...item,
            syncStatus:
              DB_SYNC_STATUS.pending,
            lastSyncError: null,
            updatedAtLocal: now
          })
        );

    await table.bulkPut(updated);

    total += updated.length;
  }

  if (total > 0) {
    notifyUpdated();
  }

  return total;
}






export async function retryAllFailedQueueItems():
Promise<number> {
  const now =
    new Date().toISOString();

  const kinds: SyncQueueKind[] = [
    'location',
    'supply',
    'demand'
  ];

  let total = 0;

  for (const kind of kinds) {
    const table =
      getTableByKind(kind);

    const items =
      await getQueueItemsByStatus(
        kind,
        DB_SYNC_STATUS.failed
      );

    if (items.length === 0) {
      continue;
    }

    const updated:
      LocalQueueRecord[] =
        items.map((item) => ({
          ...item,

          /*
           * IMPORTANT:
           * Offline queue uses lowercase statuses.
           */
          syncStatus:
            DB_SYNC_STATUS.pending,

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
  const table =
    getTableByKind(kind);

  const now =
    new Date().toISOString();

  const items =
    await table
      .where('clientOperationId')
      .equals(clientOperationId)
      .toArray();

  if (items.length === 0) {
    return;
  }

  const updated:
    LocalQueueRecord[] =
      items.map((item) => ({
        ...item,

        /*
         * Persist the actual queue status format.
         */
        syncStatus:
          DB_SYNC_STATUS.pending,

        lastSyncError: null,
        updatedAtLocal: now
      }));

  await table.bulkPut(updated);

  notifyUpdated();
}


// export async function retrySingleQueueItem(
//   kind: SyncQueueKind,
//   clientOperationId: string
// ): Promise<void> {
//   const table =
//     getTableByKind(kind);

//   const now =
//     new Date().toISOString();

//   const items =
//     await table
//       .where('clientOperationId')
//       .equals(clientOperationId)
//       .toArray();

//   if (items.length === 0) {
//     return;
//   }

//   const updated:
//     LocalQueueRecord[] =
//       items.map((item) => ({
//         ...item,
//         syncStatus: 'Pending',
//         lastSyncError: null,
//         updatedAtLocal: now
//       }));

//   await table.bulkPut(updated);

//   notifyUpdated();
// }

export async function discardLocalQueueItem(
  kind: SyncQueueKind,
  clientOperationId: string
): Promise<void> {
  const table =
    getTableByKind(kind);

  const items =
    await table
      .where('clientOperationId')
      .equals(clientOperationId)
      .toArray();

  if (items.length === 0) {
    return;
  }

  const primaryKeys =
    items
      .map(
        (item) => item.localId
      )
      .filter(
        (
          value
        ): value is number =>
          typeof value === 'number'
      );

  if (
    primaryKeys.length > 0
  ) {
    await table.bulkDelete(
      primaryKeys
    );
  }

  notifyUpdated();
}

export async function clearLocalSyncIssueLogs():
Promise<void> {
  await localDb.syncLogs.clear();

  notifyUpdated();
}

async function addSyncLog(
  level:
    | 'info'
    | 'warning'
    | 'error',
  message: string,
  metadata?: unknown
): Promise<void> {
  await localDb.syncLogs.add({
    level,
    message:
      sanitizeVisibleMessage(
        message
      ),
    metadataJson:
      metadata !== undefined
        ? JSON.stringify(metadata)
        : null,
    createdAtLocal:
      new Date().toISOString()
  });

  await pruneSyncLogs();
}

function buildFailureSignature(
  message: string,
  metadata?: unknown
): string {
  const metadataRecord =
    toRecord(metadata);

  const failureType =
    String(
      metadataRecord?.failureType ??
      'unknown'
    )
      .trim()
      .toLowerCase();

  const httpStatus =
    Number(
      metadataRecord?.httpStatus ?? 0
    ) || 0;

  const problemTitle =
    String(
      metadataRecord?.problemTitle ??
      ''
    )
      .trim()
      .toLowerCase();

  const normalizedMessage =
    sanitizeVisibleMessage(message)
      .toLowerCase();

  return [
    failureType,
    String(httpStatus),
    problemTitle,
    normalizedMessage
  ].join('|');
}

async function hasRecentEquivalentFailure(
  message: string,
  metadata?: unknown
): Promise<boolean> {
  const expectedSignature =
    buildFailureSignature(
      message,
      metadata
    );

  const cutoff =
    Date.now() -
    FAILURE_DEDUP_WINDOW_MS;

  const logs =
    (await localDb.syncLogs
      .toArray()) as LocalSyncLogRecord[];

  return logs.some((log) => {
    if (
      detectLogKind(log) !==
      'failed'
    ) {
      return false;
    }

    const createdAt =
      Date.parse(
        log.createdAtLocal ?? ''
      );

    if (
      !Number.isFinite(createdAt) ||
      createdAt < cutoff
    ) {
      return false;
    }

    const existingMetadata =
      parseMetadata(
        log.metadataJson
      );

    const existingSignature =
      buildFailureSignature(
        log.message ?? '',
        existingMetadata
      );

    return (
      existingSignature ===
      expectedSignature
    );
  });
}

export async function recordSyncFailure(
  message: string,
  metadata?: unknown
): Promise<void> {
  const isDuplicate =
    await hasRecentEquivalentFailure(
      message,
      metadata
    );

  if (!isDuplicate) {
    await addSyncLog(
      'error',
      message,
      metadata
    );
  }

  notifyUpdated();
}

async function markRejectedItemAsFailed(
  rejection: ApiSyncRejection
): Promise<void> {
  const kind = normalizeKind(
    rejection.itemType ??
    rejection.type ??
    rejection.entity
  );

  const clientOperationId =
    rejection.clientOperationId
      ?.trim();

  if (
    !kind ||
    !clientOperationId
  ) {
    return;
  }

  const table =
    getTableByKind(kind);

  const items =
    await table
      .where('clientOperationId')
      .equals(clientOperationId)
      .toArray();

  if (items.length === 0) {
    return;
  }

  const now =
    new Date().toISOString();

  const updated:
    LocalQueueRecord[] =
      items.map((item) => ({
        ...item,
        syncStatus:   DB_SYNC_STATUS.failed,
        lastSyncError:
          rejection.message ??
          rejection.code ??
          'Rejected by sync API.',
        updatedAtLocal: now
      }));

  await table.bulkPut(updated);

  notifyUpdated();
}





export async function recordSyncResponseIssues(
  response: ApiSyncResponse
): Promise<void> {
  const warnings =
    Array.isArray(
      response.warnings
    )
      ? response.warnings
      : [];

  const rejections =
    Array.isArray(
      response.rejections
    )
      ? response.rejections
      : [];

  const duplicateItems =
    Number(
      response.duplicateItems ??
      response.duplicatedItems ??
      0
    ) || 0;

  const rejectedItems =
    Number(
      response.rejectedItems ??
      rejections.length
    ) || 0;

  if (
    response.alreadyProcessed
  ) {
    await addSyncLog(
      'warning',
      'Sync batch already processed by server.',
      {
        alreadyProcessed: true,
        status: response.status,
        duplicateItems:
          duplicateItems > 0
            ? duplicateItems
            : 1
      }
    );
  }

  if (duplicateItems > 0) {
    await addSyncLog(
      'warning',
      `${duplicateItems} duplicate item(s) reported by server.`,
      {
        status: response.status,
        duplicateItems
      }
    );
  }

  for (
    const warning of warnings
  ) {
    await addSyncLog(
      'warning',
      warning,
      {
        status: response.status
      }
    );
  }

  if (
    rejectedItems > 0 &&
    rejections.length === 0
  ) {
    await addSyncLog(
      'error',
      `${rejectedItems} rejected item(s) reported by server.`,
      {
        status: response.status,
        rejectedItems
      }
    );
  }

  for (
    const rejection of rejections
  ) {
    await addSyncLog(
      'error',
      rejection.message ??
      rejection.code ??
      'Item rejected by sync API.',
      {
        itemType:
          rejection.itemType,
        type:
          rejection.type,
        entity:
          rejection.entity,
        clientOperationId:
          rejection.clientOperationId,
        code:
          rejection.code,
        message:
          rejection.message
      }
    );

    await markRejectedItemAsFailed(
      rejection
    );
  }

  notifyUpdated();
}