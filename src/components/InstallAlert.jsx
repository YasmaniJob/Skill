import { useState, useEffect, useCallback } from 'react';
import { Download, X, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IS_DEV = import.meta.env.DEV;

/**
 * Alert de instalación PWA.
 *
 * Flujos:
 * - Chrome/Edge/Android (prod): beforeinstallprompt capturado en main.jsx → botón "Instalar"
 * - iOS/Safari: sin beforeinstallprompt → instrucciones manuales
 * - Dev: siempre visible para poder probar el diseño (sin funcionalidad de instalación real)
 * - Ya instalada (standalone) o descartada: no aparece
 */
const InstallAlert = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow]                     = useState(false);
  const [isIOS, setIsIOS]                   = useState(false);

  const handleDismiss = useCallback(() => {
    if (!IS_DEV) {
      localStorage.setItem('pwa_alert_dismissed', 'true');
    }
    setShow(false);
  }, []);

  useEffect(() => {
    // Ya instalada en modo standalone → no mostrar
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    // En DEV: mostrar siempre para poder ver el diseño
    if (IS_DEV) {
      setShow(true);
      return;
    }

    // En PRODUCCIÓN: respetar si el usuario ya descartó
    if (localStorage.getItem('pwa_alert_dismissed') === 'true') return;

    // Detectar iOS (Safari no dispara beforeinstallprompt)
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (ios) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    // Chrome/Edge/Android: el prompt puede haber llegado antes de montar
    // (capturado globalmente en main.jsx) o llegar después
    if (window.__pwaInstallPrompt) {
      setDeferredPrompt(window.__pwaInstallPrompt);
      setShow(true);
    }

    const onReady = () => {
      if (window.__pwaInstallPrompt) {
        setDeferredPrompt(window.__pwaInstallPrompt);
        setShow(true);
      }
    };

    const onInstalled = () => handleDismiss();

    window.addEventListener('pwa-install-ready', onReady);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('pwa-install-ready', onReady);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [handleDismiss]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      window.__pwaInstallPrompt = null;
      handleDismiss();
    }
    setDeferredPrompt(null);
  };

  // En dev mostramos el alert en modo "Chrome" para ver el diseño completo
  const showInstallButton = IS_DEV ? true : !isIOS;
  const showIOSInstructions = IS_DEV ? false : isIOS;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="mb-6 flex items-center gap-3 px-4 py-3 bg-[#4f46e5]/5 border border-[#4f46e5]/20 rounded-xl"
        >
          {/* Icono */}
          <div className="p-1.5 bg-[#4f46e5]/10 rounded-lg shrink-0">
            {showIOSInstructions
              ? <Share className="w-4 h-4 text-[#4f46e5]" />
              : <Download className="w-4 h-4 text-[#4f46e5]" />
            }
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mb-0.5">
              Instalar Skill
            </p>

            {showIOSInstructions ? (
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                En Safari, pulsa{' '}
                <span className="inline-flex items-center gap-0.5 text-[#4f46e5] font-bold">
                  Compartir <Share className="w-3 h-3" />
                </span>{' '}
                y luego{' '}
                <span className="text-slate-700 font-bold">"Añadir a pantalla de inicio"</span>.
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 font-semibold">
                Accede sin navegador desde tu escritorio o móvil.
              </p>
            )}
          </div>

          {/* Botón instalar (Chrome/Edge/Android y dev) */}
          {showInstallButton && (
            <button
              onClick={IS_DEV ? handleDismiss : handleInstall}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Instalar
            </button>
          )}

          {/* Cerrar */}
          <button
            onClick={handleDismiss}
            className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallAlert;
