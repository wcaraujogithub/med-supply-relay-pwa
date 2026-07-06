// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Wesley Cordeiro de Araujo
// See NOTICE for additional attribution and origin notices.

import { PROJECT_INFO } from '../../config/projectInfo';
import { useI18n } from '../../i18n/I18nProvider';

export function CommunityPilotNotice() {
  const { t } = useI18n();

  return (
    <section
      className="community-pilot-notice"
      aria-labelledby="community-pilot-title"
    >
      <div className="community-pilot-notice__badge">
        {t('pilot.badge')}
      </div>

      <div className="community-pilot-notice__content">
        <div>
          <p className="community-pilot-notice__eyebrow">
            {t('pilot.projectType')}
          </p>

          <h2 id="community-pilot-title">
            {t('pilot.title')}
          </h2>

          <p>
            {t('pilot.description')}
          </p>
        </div>

        <div className="community-pilot-notice__warnings">
          <p>
            <strong>
              {t('pilot.notOfficialTitle')}
            </strong>{' '}
            {t('pilot.notOfficialDescription')}
          </p>

          <p>
            <strong>
              {t('pilot.dataWarningTitle')}
            </strong>{' '}
            {t('pilot.dataWarningDescription')}
          </p>
        </div>

        <div className="community-pilot-notice__footer">
          <span>
            {PROJECT_INFO.name} ·{' '}
            {PROJECT_INFO.license}
          </span>

          <a
            href={PROJECT_INFO.repositoryUrl}
            target="_blank"
            rel="noreferrer"
          >
            {t('pilot.viewSource')}
          </a>
        </div>
      </div>
    </section>
  );
}