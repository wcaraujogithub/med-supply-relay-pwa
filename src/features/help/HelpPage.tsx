import { useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import {
  businessRuleKeys,
  emergencyRuleKeys,
  flowCards,
  helpScreenshots
} from './helpContent';

type HelpPageProps = {
  onBack: () => void;
};

type HelpScreenshotCardProps = {
  title: string;
  text: string;
  imageSrc: string;
  fileName: string;
};

function HelpScreenshotCard({
  title,
  text,
  imageSrc,
  fileName
}: HelpScreenshotCardProps) {
  const { t } = useI18n();
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <article className="help-screenshot-card">
      <div className="help-screenshot-frame">
        {!hasImageError ? (
          <img
            src={imageSrc}
            alt={title}
            loading="lazy"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="help-screenshot-placeholder">
            {t('help.screenshotMissing', { file: fileName })}
          </div>
        )}
      </div>

      <div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </article>
  );
}

export function HelpPage({ onBack }: HelpPageProps) {
  const { t } = useI18n();

  return (
    <main className="help-page">
      <header className="help-hero">
        <div>
          <p className="eyebrow">{t('help.open')}</p>
          <h2>{t('help.title')}</h2>
          <p>{t('help.subtitle')}</p>
        </div>

        <button type="button" className="secondary-button" onClick={onBack}>
          {t('help.back')}
        </button>
      </header>

      <section className="help-section">
        <h3>{t('help.sectionFlow')}</h3>

        <div className="help-flow-grid">
          {flowCards.map((card) => (
            <article className="help-flow-card" key={card.titleKey}>
              <h4>{t(card.titleKey)}</h4>
              <p>{t(card.textKey)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="help-section">
        <h3>{t('help.sectionRules')}</h3>

        <div className="help-rules-grid">
          {businessRuleKeys.map((key) => (
            <article className="help-rule-card" key={key}>
              <span>✓</span>
              <p>{t(key)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="help-section">
        <h3>{t('help.sectionEmergency')}</h3>

        <div className="help-emergency-list">
          {emergencyRuleKeys.map((key) => (
            <p key={key}>{t(key)}</p>
          ))}
        </div>
      </section>

      <section className="help-section">
        <h3>{t('help.sectionScreens')}</h3>

        <div className="help-screenshot-grid">
          {helpScreenshots.map((screen) => (
            <HelpScreenshotCard
              key={screen.fileName}
              title={t(screen.titleKey)}
              text={t(screen.textKey)}
              imageSrc={screen.imageSrc}
              fileName={screen.fileName}
            />
          ))}
        </div>
      </section>
    </main>
  );
}