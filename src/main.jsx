import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// Capturar beforeinstallprompt lo antes posible (antes de que React monte)
// para que InstallAlert pueda recuperarlo aunque llegue antes del primer render.
window.__pwaInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__pwaInstallPrompt = e;
  // Disparar evento custom para que InstallAlert lo reciba si ya está montado
  window.dispatchEvent(new Event('pwa-install-ready'));
});

// El Service Worker es registrado automáticamente por vite-plugin-pwa en producción.
// En desarrollo está desactivado (devOptions.enabled: false en vite.config.js)
// para no interferir con el HMR de Vite.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
