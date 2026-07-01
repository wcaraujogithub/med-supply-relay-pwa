const DEVICE_ID_STORAGE_KEY = 'msr.deviceId';
const OPERATOR_ALIAS_STORAGE_KEY = 'msr.operatorAlias';

export function createClientId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
}

export function getOrCreateDeviceId(): string {
  const current = localStorage.getItem(DEVICE_ID_STORAGE_KEY);

  if (current && current.trim().length > 0) {
    return current;
  }

  const next = createClientId();
  localStorage.setItem(DEVICE_ID_STORAGE_KEY, next);

  return next;
}

export function getOperatorAlias(): string | null {
  const value = localStorage.getItem(OPERATOR_ALIAS_STORAGE_KEY);

  return value && value.trim().length > 0
    ? value.trim()
    : null;
}

export function setOperatorAlias(value: string | null): void {
  if (!value || value.trim().length === 0) {
    localStorage.removeItem(OPERATOR_ALIAS_STORAGE_KEY);
    return;
  }

  localStorage.setItem(OPERATOR_ALIAS_STORAGE_KEY, value.trim());
}