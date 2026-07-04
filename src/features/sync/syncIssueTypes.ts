/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */
export type SyncQueueKind = 'location' | 'supply' | 'demand';

export type SyncIssueLogKind =
  | 'info'
  | 'warning'
  | 'failed'
  | 'rejected'
  | 'duplicate';

export type SyncQueueStatus =
  | 'Pending'
  | 'Syncing'
  | 'Synced'
  | 'Failed'
  | string;

export interface SyncIssueQueueItem {
  kind: SyncQueueKind;
  clientOperationId: string;
  title: string;
  subtitle: string;
  status: SyncQueueStatus;
  error?: string | null;
  updatedAtLocal?: string | null;
}

export interface SyncIssueLogItem {
  localId?: number;
  kind: SyncIssueLogKind;
  level: string;
  message: string;
  createdAtLocal: string;
  metadataJson?: string | null;
}

export interface SyncIssueSnapshot {
  generatedAtLocal: string;

  pendingTotal: number;
  syncingTotal: number;
  syncedTotal: number;
  failedTotal: number;

  rejectedTotal: number;
  duplicateTotal: number;
  warningTotal: number;

  failedItems: SyncIssueQueueItem[];
  logs: SyncIssueLogItem[];
}