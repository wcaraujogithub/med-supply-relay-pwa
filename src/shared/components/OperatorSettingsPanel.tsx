/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */

import { useEffect, useState } from 'react';
import {
  getOperatorAlias,
  getOrCreateDeviceId,
  OPERATOR_ALIAS_CHANGED_EVENT,
  setOperatorAlias
} from '../../db/deviceIdentity';
import { useI18n } from '../../i18n/I18nProvider';

export function OperatorSettingsPanel() {
  const { t } = useI18n();

  const [deviceId] = useState(() => getOrCreateDeviceId());
  const [operatorAlias, setOperatorAliasState] = useState(
    () => getOperatorAlias() ?? ''
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    function handleChanged(): void {
      setOperatorAliasState(getOperatorAlias() ?? '');
    }

    window.addEventListener(OPERATOR_ALIAS_CHANGED_EVENT, handleChanged);

    return () => {
      window.removeEventListener(OPERATOR_ALIAS_CHANGED_EVENT, handleChanged);
    };
  }, []);

  function handleSave(): void {
    setOperatorAlias(operatorAlias);
    setSavedMessage(t('operator.saved'));

    window.setTimeout(() => {
      setSavedMessage(null);
    }, 2500);
  }

  function handleClear(): void {
    setOperatorAlias(null);
    setOperatorAliasState('');
    setSavedMessage(t('operator.removed'));
  }

  return (
    <section className="operator-panel">
      <div className="section-title-row">
        <div>
          <h3>{t('operator.title')}</h3>
          <p>{t('operator.description')}</p>
        </div>

        <span className="offline-pill">
          {operatorAlias.trim() ? t('operator.defined') : t('operator.empty')}
        </span>
      </div>

      <div className="operator-grid">
        <label>
          <span>{t('operator.alias')}</span>
          <input
            value={operatorAlias}
            onChange={(event) => setOperatorAliasState(event.target.value)}
            placeholder={t('operator.aliasPlaceholder')}
          />
        </label>

        <label>
          <span>{t('operator.deviceId')}</span>
          <input value={deviceId} readOnly />
        </label>
      </div>

      <div className="operator-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={handleSave}
        >
          {t('operator.save')}
        </button>

        <button
          type="button"
          className="secondary-button secondary-button--danger"
          onClick={handleClear}
        >
          {t('operator.remove')}
        </button>
      </div>

      {savedMessage && <p className="storage-message">{savedMessage}</p>}
    </section>
  );
}