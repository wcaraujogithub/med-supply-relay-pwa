import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import {
  DEFAULT_LANGUAGE,
  messages,
  type AppLanguage
} from './messages';

const STORAGE_KEY = 'msr.language';

type InterpolationValues = Record<string, string | number>;

type I18nContextValue = {
  language: AppLanguage;
  locale: string;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string, values?: InterpolationValues) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLanguage(): AppLanguage {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved === 'pt' || saved === 'es') {
    return saved;
  }

  return DEFAULT_LANGUAGE;
}

function interpolate(
  template: string,
  values?: InterpolationValues
): string {
  if (!values) {
    return template;
  }

  return Object.entries(values).reduce((current, [key, value]) => {
    return current.replaceAll(`{${key}}`, String(value));
  }, template);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(getInitialLanguage);

  const locale = language === 'es' ? 'es-VE' : 'pt-BR';

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    localStorage.setItem(STORAGE_KEY, nextLanguage);
    setLanguageState(nextLanguage);
  }, []);

  const t = useCallback(
    (key: string, values?: InterpolationValues) => {
      const template =
        messages[language][key] ??
        messages.pt[key] ??
        messages.es[key] ??
        key;

      return interpolate(template, values);
    },
    [language]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      locale,
      setLanguage,
      t
    }),
    [language, locale, setLanguage, t]
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider.');
  }

  return context;
}