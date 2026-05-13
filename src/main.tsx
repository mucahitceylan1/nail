// src/main.tsx
// Nail Lab. by İldem — Entry Point
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n/config';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Clear any existing Service Workers to prevent "NavigatorLockAcquireTimeoutError" and cache issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then(() => {
        console.log('Old Service Worker unregistered');
        if (registrations.indexOf(registration) === registrations.length - 1) {
          // window.location.reload(); // Optional: reload once cleared
        }
      });
    }
  });
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
