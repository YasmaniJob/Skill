import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// CONTROL ARQUITECTÓNICO DEL SERVICE WORKER
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // EN DESARROLLO: Eliminar activamente el Service Worker para evitar bloqueos e interferencias con Vite HMR
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister().then(() => {
          console.log('[Vite Dev] Service Worker antiguo eliminado automáticamente.');
        });
      }
    });
  } else {
    // EN PRODUCCIÓN: Registrar el Service Worker con la estrategia responsiva offline
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registrado en producción:', reg.scope))
        .catch(err => console.error('Error al registrar Service Worker:', err));
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
