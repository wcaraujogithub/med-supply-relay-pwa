// import { useEffect, useState } from 'react';
// import { useI18n } from '../../i18n/I18nProvider';

// type LicenseNoticeModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   onOpenHelp: () => void;
// };

// const LICENSE_ACK_KEY = 'msr.licenseNoticeAcknowledged.v1';

// export function shouldShowLicenseNotice(): boolean {
//   return localStorage.getItem(LICENSE_ACK_KEY) !== 'true';
// }

// export function LicenseNoticeModal({
//   isOpen,
//   onClose,
//   onOpenHelp
// }: LicenseNoticeModalProps) {
//   const { t } = useI18n();
  
//   const [showAgain, setShowAgain] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       setShowAgain(false);
//     }
//   }, [isOpen]);

//   if (!isOpen) {
//     return null;
//   }

//   function handleAccept(): void {
//     if (!showAgain) {
//       localStorage.setItem(LICENSE_ACK_KEY, 'true');
//     } else {
//       localStorage.removeItem(LICENSE_ACK_KEY);
//     }

//     onClose();
//   }

//   function handleOpenHelp(): void {
//     onClose();
//     onOpenHelp();
//   }

//   return (
//     <div className="modal-backdrop license-modal-backdrop" role="presentation">
//       <section
//         className="modal-card license-modal"
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="license-modal-title"
//       >
//         <header className="modal-header">
//           <div>
//             <p className="eyebrow">AGPL-3.0-or-later</p>
//             <h2 id="license-modal-title">{t('license.title')}</h2>     
//             <p>{t('license.subtitle')}</p>
//           </div>

//           <button
//             type="button"
//             className="icon-button"
//             aria-label={t('license.close')}
//             onClick={onClose}
//           >
//             ×
//           </button>
//         </header>

//         <div className="license-modal-content">
//           <div className="license-card-grid">
//             <article>
//               <h3>{t('license.authorTitle')}</h3>               
//               <p>{t('license.authorText')}</p>
           
//             </article>

//             <article>
//               <h3>{t('license.licenseTitle')}</h3>
//               <p>{t('license.licenseText')}</p>
//             </article>

//             <article>
//               <h3>{t('license.networkTitle')}</h3>
//               <p>{t('license.networkText')}</p>
//             </article>

//             <article>
//               <h3>{t('license.sameTitle')}</h3>
//               <p>{t('license.sameText')}</p>
//             </article>

//             <article className="license-card-grid__wide">
//               <h3>{t('license.noWarrantyTitle')}</h3>
//               <p>{t('license.noWarrantyText')}</p>
//             </article>
//           </div>

//           <label className="license-show-again">
//             <input
//               type="checkbox"
//               checked={showAgain}
//               onChange={(event) => setShowAgain(event.target.checked)}
//             />
//             <span>{t('license.showAgain')}</span>
//           </label>

//           <footer className="modal-actions">
//             <button
//               type="button"
//               className="secondary-button"
//               onClick={handleOpenHelp}
//             >
//               {t('license.readMore')}
//             </button>

//             <button
//               type="button"
//               className="submit-button"
//               onClick={handleAccept}
//             >
//               {t('license.accept')}
//             </button>
//           </footer>
//         </div>
//       </section>
//     </div>
//   );
// }


import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';

type LicenseNoticeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
};

const LICENSE_AUTO_SHOW_KEY = 'msr.licenseNotice.autoShow.v1';

export function getLicenseAutoShowPreference(): boolean {
  const savedValue = localStorage.getItem(LICENSE_AUTO_SHOW_KEY);

  if (savedValue === 'false') {
    return false;
  }

  return true;
}

export function shouldShowLicenseNotice(): boolean {
  return getLicenseAutoShowPreference();
}

export function LicenseNoticeModal({
  isOpen,
  onClose,
  onOpenHelp
}: LicenseNoticeModalProps) {
  const { t } = useI18n();

  const [showAgain, setShowAgain] = useState<boolean>(() =>
    getLicenseAutoShowPreference()
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setShowAgain(getLicenseAutoShowPreference());
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function persistPreference(value: boolean): void {
    localStorage.setItem(
      LICENSE_AUTO_SHOW_KEY,
      String(value)
    );

    setShowAgain(value);
  }

  function handleShowAgainChanged(value: boolean): void {
    persistPreference(value);
  }

  function handleAccept(): void {
    persistPreference(showAgain);
    onClose();
  }

  function handleOpenHelp(): void {
    persistPreference(showAgain);
    onClose();
    onOpenHelp();
  }

  return (
    <div
      className="modal-backdrop license-modal-backdrop"
      role="presentation"
    >
      <section
        className="modal-card license-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="license-modal-title"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">
              AGPL-3.0-or-later
            </p>

            <h2 id="license-modal-title">
              {t('license.title')}
            </h2>

            <p>{t('license.subtitle')}</p>
          </div>

          <button
            type="button"
            className="icon-button"
            aria-label={t('license.close')}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="license-modal-content">
          <div className="license-card-grid">
            <article>
              <h3>{t('license.authorTitle')}</h3>
              <p>{t('license.authorText')}</p>
            </article>

            <article>
              <h3>{t('license.licenseTitle')}</h3>
              <p>{t('license.licenseText')}</p>
            </article>

            <article>
              <h3>{t('license.networkTitle')}</h3>
              <p>{t('license.networkText')}</p>
            </article>

            <article>
              <h3>{t('license.sameTitle')}</h3>
              <p>{t('license.sameText')}</p>
            </article>

            <article className="license-card-grid__wide">
              <h3>{t('license.noWarrantyTitle')}</h3>
              <p>{t('license.noWarrantyText')}</p>
            </article>
          </div>

          <label className="license-show-again">
            <input
              type="checkbox"
              checked={showAgain}
              onChange={(event) =>
                handleShowAgainChanged(event.target.checked)
              }
            />

            <span>
              {t('license.showAgain')}
            </span>
          </label>

          <footer className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleOpenHelp}
            >
              {t('license.readMore')}
            </button>

            <button
              type="button"
              className="submit-button"
              onClick={handleAccept}
            >
              {t('license.accept')}
            </button>
          </footer>
        </div>
      </section>
    </div>
  );
}