import { useEffect, useState } from 'react';
import {
  clearLocalSyncIssueLogs,
  discardLocalQueueItem,
  getOfflineSyncIssueSnapshot,
  retryAllFailedQueueItems,
  retrySingleQueueItem,
  SYNC_ISSUES_UPDATED_EVENT
} from '../../db/offlineSyncIssues';
import { useI18n } from '../../i18n/I18nProvider';
import type {
  SyncIssueSnapshot,
  SyncQueueKind,
  SyncQueueStatus
} from './syncIssueTypes';

type SyncIssuesPanelProps = {
  onSyncNow: () => Promise<unknown> | unknown;
};

function formatDate(value?: string | null): string {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString();
}

export function SyncIssuesPanel({ onSyncNow }: SyncIssuesPanelProps) {
  const { t } = useI18n();

  const [snapshot, setSnapshot] = useState<SyncIssueSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const hasIssues =
    snapshot !== null &&
    (
      snapshot.failedTotal > 0 ||
      snapshot.rejectedTotal > 0 ||
      snapshot.duplicateTotal > 0 ||
      snapshot.warningTotal > 0
    );

  async function loadSnapshot(): Promise<void> {
    setIsLoading(true);

    try {
      const result = await getOfflineSyncIssueSnapshot();
      setSnapshot(result);

      if (
        result.failedTotal > 0 ||
        result.rejectedTotal > 0 ||
        result.duplicateTotal > 0 ||
        result.warningTotal > 0
      ) {
        setIsExpanded(true);
      }
    } catch {
      setMessage(t('syncIssues.reloadFail'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRetryAll(): Promise<void> {
    setMessage(null);

    try {
      const count = await retryAllFailedQueueItems();
      setMessage(t('syncIssues.retryAllOk', { count }));
      await onSyncNow();
      await loadSnapshot();
    } catch {
      setMessage(t('syncIssues.retryFail'));
    }
  }

  async function handleRetryOne(
    kind: SyncQueueKind,
    clientOperationId: string
  ): Promise<void> {
    setMessage(null);

    try {
      await retrySingleQueueItem(kind, clientOperationId);
      setMessage(t('syncIssues.retryOneOk'));
      await onSyncNow();
      await loadSnapshot();
    } catch {
      setMessage(t('syncIssues.retryFail'));
    }
  }

  async function handleDiscard(
    kind: SyncQueueKind,
    clientOperationId: string
  ): Promise<void> {
    const confirmed = window.confirm(t('syncIssues.confirmDiscard'));

    if (!confirmed) {
      return;
    }

    setMessage(null);

    try {
      await discardLocalQueueItem(kind, clientOperationId);
      setMessage(t('syncIssues.discardOk'));
      await loadSnapshot();
    } catch {
      setMessage(t('syncIssues.discardFail'));
    }
  }

  async function handleClearLogs(): Promise<void> {
    setMessage(null);

    try {
      await clearLocalSyncIssueLogs();
      setMessage(t('syncIssues.clearOk'));
      await loadSnapshot();
    } catch {
      setMessage(t('syncIssues.clearFail'));
    }
  }

  function kindLabel(kind: SyncQueueKind): string {
    switch (kind) {
      case 'location':
        return t('syncIssues.location');
      case 'supply':
        return t('syncIssues.supply');
      case 'demand':
        return t('syncIssues.demand');
      default:
        return t('syncIssues.unknown');
    }
  }

  function statusLabel(status: SyncQueueStatus): string {
    switch (status) {
      case 'Pending':
        return t('syncIssues.statusPending');
      case 'Syncing':
        return t('syncIssues.statusSyncing');
      case 'Synced':
        return t('syncIssues.statusSynced');
      case 'Failed':
        return t('syncIssues.statusFailed');
      default:
        return String(status);
    }
  }

  useEffect(() => {
    void loadSnapshot();

    function handleUpdated(): void {
      void loadSnapshot();
    }

    window.addEventListener(SYNC_ISSUES_UPDATED_EVENT, handleUpdated);

    return () => {
      window.removeEventListener(SYNC_ISSUES_UPDATED_EVENT, handleUpdated);
    };
  }, []);

  return (
    <section
      className={`sync-issues-panel ${
        hasIssues ? 'sync-issues-panel--warning' : ''
      }`}
    >
      <div className="section-title-row">
        <div>
          <h3>{t('syncIssues.title')}</h3>
          <p>
            {hasIssues
              ? t('syncIssues.description')
              : t('syncIssues.healthy')}
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? t('common.hideDetails') : t('common.showDetails')}
        </button>
      </div>

      <div className="sync-issues-grid">
        <div>
          <strong>{snapshot?.pendingTotal ?? 0}</strong>
          <span>{t('syncIssues.pending')}</span>
        </div>

        <div className={snapshot?.failedTotal ? 'danger' : ''}>
          <strong>{snapshot?.failedTotal ?? 0}</strong>
          <span>{t('syncIssues.failed')}</span>
        </div>

        <div className={snapshot?.rejectedTotal ? 'danger' : ''}>
          <strong>{snapshot?.rejectedTotal ?? 0}</strong>
          <span>{t('syncIssues.rejected')}</span>
        </div>

        <div className={snapshot?.duplicateTotal ? 'warning' : ''}>
          <strong>{snapshot?.duplicateTotal ?? 0}</strong>
          <span>{t('syncIssues.duplicates')}</span>
        </div>

        <div className={snapshot?.warningTotal ? 'warning' : ''}>
          <strong>{snapshot?.warningTotal ?? 0}</strong>
          <span>{t('syncIssues.warnings')}</span>
        </div>
      </div>

      <div className="sync-issues-actions">
        <button
          type="button"
          className="secondary-button"
          disabled={isLoading}
          onClick={() => void loadSnapshot()}
        >
          {t('syncIssues.refresh')}
        </button>

        <button
          type="button"
          className="secondary-button"
          disabled={isLoading || !snapshot || snapshot.failedTotal === 0}
          onClick={() => void handleRetryAll()}
        >
          {t('syncIssues.retryAll')}
        </button>

        <button
          type="button"
          className="submit-button"
          disabled={isLoading}
          onClick={() => void onSyncNow()}
        >
          {t('syncIssues.syncNow')}
        </button>

        <button
          type="button"
          className="secondary-button secondary-button--danger"
          disabled={isLoading || !snapshot || snapshot.logs.length === 0}
          onClick={() => void handleClearLogs()}
        >
          {t('syncIssues.clearLogs')}
        </button>
      </div>

      {message && <p className="storage-message">{message}</p>}

      {isExpanded && (
        <div className="sync-issues-details">
          <section>
            <h4>{t('syncIssues.failedQueue')}</h4>

            {snapshot && snapshot.failedItems.length > 0 ? (
              <div className="sync-issue-list">
                {snapshot.failedItems.map((item) => (
                  <article
                    className="sync-issue-card"
                    key={`${item.kind}-${item.clientOperationId}`}
                  >
                    <div>
                      <span className="sync-issue-kind">
                        {kindLabel(item.kind)}
                      </span>

                      <strong>{item.title}</strong>

                      <small>{item.subtitle}</small>

                      {item.error && (
                        <p className="sync-issue-error">{item.error}</p>
                      )}

                      <small>{statusLabel(item.status)}</small>
                    </div>

                    <div className="sync-issue-card-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          void handleRetryOne(
                            item.kind,
                            item.clientOperationId
                          )
                        }
                      >
                        {t('syncIssues.retry')}
                      </button>

                      <button
                        type="button"
                        className="secondary-button secondary-button--danger"
                        onClick={() =>
                          void handleDiscard(
                            item.kind,
                            item.clientOperationId
                          )
                        }
                      >
                        {t('syncIssues.discard')}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="sync-issue-empty">
                {t('syncIssues.noFailedItems')}
              </p>
            )}
          </section>

          <section>
            <h4>{t('syncIssues.lastLogs')}</h4>

            {snapshot && snapshot.logs.length > 0 ? (
              <div className="sync-log-list">
                {snapshot.logs.map((log) => (
                  <article
                    className={`sync-log-card sync-log-card--${log.kind}`}
                    key={`${log.localId ?? log.createdAtLocal}-${log.message}`}
                  >
                    <div>
                      <span>{log.kind}</span>
                      <strong>{log.message}</strong>
                      <small>{formatDate(log.createdAtLocal)}</small>
                    </div>

                    {log.metadataJson && (
                      <details>
                        <summary>metadata</summary>
                        <pre>{log.metadataJson}</pre>
                      </details>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="sync-issue-empty">
                {t('syncIssues.noLogs')}
              </p>
            )}
          </section>
        </div>
      )}
    </section>
  );
}