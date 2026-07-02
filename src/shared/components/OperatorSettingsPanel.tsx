import { useEffect, useState } from 'react';
import {
  getOperatorAlias,
  getOrCreateDeviceId,
  OPERATOR_ALIAS_CHANGED_EVENT,
  setOperatorAlias
} from '../../db/deviceIdentity';

export function OperatorSettingsPanel() {
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
    setSavedMessage('Operador salvo neste dispositivo.');

    window.setTimeout(() => {
      setSavedMessage(null);
    }, 2500);
  }

  function handleClear(): void {
    setOperatorAlias(null);
    setOperatorAliasState('');
    setSavedMessage('Operador removido.');
  }

  return (
    <section className="operator-panel">
      <div className="section-title-row">
        <div>
          <h3>Identificação local</h3>
          <p>
            Use um apelido simples para identificar quem registrou os dados neste
            dispositivo.
          </p>
        </div>

        <span className="offline-pill">
          {operatorAlias.trim() ? 'Operador definido' : 'Sem operador'}
        </span>
      </div>

      <div className="operator-grid">
        <label>
          <span>Apelido do operador</span>
          <input
            value={operatorAlias}
            onChange={(event) => setOperatorAliasState(event.target.value)}
            placeholder="Ex.: voluntario-joao, triagem-manha"
          />
        </label>

        <label>
          <span>ID do dispositivo</span>
          <input value={deviceId} readOnly />
        </label>
      </div>

      <div className="operator-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={handleSave}
        >
          Salvar operador
        </button>

        <button
          type="button"
          className="secondary-button secondary-button--danger"
          onClick={handleClear}
        >
          Remover
        </button>
      </div>

      {savedMessage && <p className="storage-message">{savedMessage}</p>}
    </section>
  );
}