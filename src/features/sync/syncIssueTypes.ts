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