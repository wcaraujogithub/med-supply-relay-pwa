import type { ReactNode } from 'react';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">
          +
        </div>

        <div>
          <h1>MedSupply Relay</h1>
          <p>Oferta e demanda de medicamentos em modo contingência.</p>
        </div>
      </header>

      <main>{children}</main>

      <footer className="app-footer">
        <p>
          Ferramenta humanitária de contingência. Não substitui coordenação oficial,
          validação clínica ou transporte autorizado.
        </p>
      </footer>
    </div>
  );
}