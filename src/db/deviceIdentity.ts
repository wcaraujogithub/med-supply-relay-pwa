/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */

const DEVICE_ID_STORAGE_KEY = 'msr.deviceId';
const OPERATOR_ALIAS_STORAGE_KEY = 'msr.operatorAlias';

export const OPERATOR_ALIAS_CHANGED_EVENT = 'msr:operator-alias-changed';



export function createClientId(): string {
  const cryptoApi = globalThis.crypto;

  if (
    cryptoApi &&
    typeof cryptoApi.randomUUID === 'function'
  ) {
    return cryptoApi.randomUUID();
  }

  if (
    cryptoApi &&
    typeof cryptoApi.getRandomValues === 'function'
  ) {
    const bytes = new Uint8Array(16);

    cryptoApi.getRandomValues(bytes);

    // UUID v4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;

    // RFC 4122 variant
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(
      bytes,
      (value) => value.toString(16).padStart(2, '0')
    );

    return [
      hex.slice(0, 4).join(''),
      hex.slice(4, 6).join(''),
      hex.slice(6, 8).join(''),
      hex.slice(8, 10).join(''),
      hex.slice(10, 16).join('')
    ].join('-');
  }

  return createEmergencyFallbackId();
}

function createEmergencyFallbackId(): string {
  const timestamp = Date.now().toString(16).padStart(12, '0');
  const performancePart = Math
    .floor(
      typeof performance !== 'undefined'
        ? performance.now() * 1000
        : 0
    )
    .toString(16)
    .padStart(8, '0');

  const randomPart = Math
    .floor(Math.random() * Number.MAX_SAFE_INTEGER)
    .toString(16)
    .padStart(14, '0');

  const source = `${timestamp}${performancePart}${randomPart}`
    .padEnd(32, '0')
    .slice(0, 32)
    .split('');

  source[12] = '4';

  const variant = parseInt(source[16], 16);

  source[16] = ((variant & 0x3) | 0x8).toString(16);

  return [
    source.slice(0, 8).join(''),
    source.slice(8, 12).join(''),
    source.slice(12, 16).join(''),
    source.slice(16, 20).join(''),
    source.slice(20, 32).join('')
  ].join('-');
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
  } else {
    localStorage.setItem(OPERATOR_ALIAS_STORAGE_KEY, value.trim());
  }

  window.dispatchEvent(
    new CustomEvent(OPERATOR_ALIAS_CHANGED_EVENT, {
      detail: {
        operatorAlias: getOperatorAlias()
      }
    })
  );
}