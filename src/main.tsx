import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ErrorBoundary } from '@/components/ui';
import { clearSession } from '@/lib';

import App from './App';

function resetSession() {
  clearSession();
  window.location.reload();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary onReset={resetSession}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
