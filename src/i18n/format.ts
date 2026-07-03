import type { AppLanguage } from './messages';

export function formatAppNumber(
  value: number,
  language: AppLanguage
): string {
  return new Intl.NumberFormat(language === 'es' ? 'es-VE' : 'pt-BR', {
    maximumFractionDigits: 3
  }).format(value);
}

export function formatAppDateTime(
  value: string | Date,
  language: AppLanguage
): string {
  const date = typeof value === 'string' ? new Date(value) : value;

  return date.toLocaleString(language === 'es' ? 'es-VE' : 'pt-BR');
}