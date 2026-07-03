import { useI18n } from './I18nProvider';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="language-switcher" aria-label={t('language.label')}>
      <button
        type="button"
        className={language === 'es' ? 'active' : ''}
        onClick={() => setLanguage('es')}
      >
        ES
      </button>

      <button
        type="button"
        className={language === 'pt' ? 'active' : ''}
        onClick={() => setLanguage('pt')}
      >
        PT
      </button>
    </div>
  );
}