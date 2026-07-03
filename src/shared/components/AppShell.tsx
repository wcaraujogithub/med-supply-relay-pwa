import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';

// type AppShellProps = {
//   children: ReactNode;
// };


type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { t } = useI18n();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">
          +
        </div>

        <div className="brand-copy">
          <h1>{t('app.name')}</h1>
          <p>{t('app.subtitle')}</p>
        </div>

        <LanguageSwitcher />
      </header>

      {children}

      <footer className="app-footer">
        {t('app.disclaimer')}
      </footer>
    </div>
  );
}
// export function AppShell({ children }: AppShellProps) {
//   return (
//     <div className="app-shell">
//       <header className="app-header">
//         <div className="brand-mark" aria-hidden="true">
//           +
//         </div>

//         <div>
//           <h1>MedSupply Relay</h1>
//           <p>Oferta e demanda de medicamentos em modo contingência.</p>
//         </div>
//       </header>

//       <main>{children}</main>

//       <footer className="app-footer">
//         <p>
//           Ferramenta humanitária de contingência. Não substitui coordenação oficial,
//           validação clínica ou transporte autorizado.
//         </p>
//       </footer>
//     </div>
//   );
// }