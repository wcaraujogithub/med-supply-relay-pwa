
  // SPDX-License-Identifier: AGPL-3.0-or-later
  // Copyright (C) 2026 Wesley Cordeiro de Araujo
  // See NOTICE for additional attribution and origin notices.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from './i18n/I18nProvider';
import App from './App';
import './App.css';
import { registerServiceWorker } from './pwa/registerServiceWorker';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found.');
}

// createRoot(rootElement).render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);

registerServiceWorker();