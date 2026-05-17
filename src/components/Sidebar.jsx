import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useIE } from '../hooks/useIE.jsx';
import {
  LayoutDashboard, ClipboardList, History,
  LogOut, X, Menu, CalendarDays,
  BarChart3, UserPlus, ShieldCheck, Download
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

// Menú según rol
const MENU_IE = [
  { icon: LayoutDashboard, label: 'Dashboard',   path: '/' },
  { icon: ClipboardList,   label: 'Monitorear',  path: '/nuevo' },
  { icon: History,         label: 'Monitoreos',  path: '/registros' },
  { icon: BarChart3,       label: 'Reportes',    path: '/reportes' },
  { icon: CalendarDays,    label: 'Periodos',    path: '/periodos',    roles: ['admin'] },
  { icon: UserPlus,        label: 'Personal',    path: '/gestion',     roles: ['admin'] },
];

const MENU_SUPER_ADMIN = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/' },
  { icon: ShieldCheck,     label: 'Instituciones',  path: '/instituciones' },
];

const Sidebar = () => {
  const { logout, perfil, esAdmin, esSuperAdmin, ieId } = useAuth();
  const { fetchIE } = useIE();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [ie, setIe] = useState(null);

  // Estados PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (ieId) {
      fetchIE(ieId).then(data => { if (!cancelled) setIe(data); });
    } else {
      setIe(null);
    }
    return () => { cancelled = true; };
  }, [ieId, fetchIE]);

  useEffect(() => {
    // 1. Detectar si ya está en modo standalone (instalado)
    const standaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(standaloneMode);

    // 2. Detectar si es iOS
    const iosDetected = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iosDetected);

    // 3. Revisar memoria local si el usuario ya descartó la invitación
    const dismissed = localStorage.getItem('pwa_install_dismissed') === 'true';
    setIsDismissed(dismissed);

    // 4. Capturar el prompt de instalación de Chrome/Edge/Android
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // 5. Escuchar instalación exitosa para quitar el banner en el acto
    const handleAppInstalled = () => {
      setIsInstallable(false);
      localStorage.setItem('pwa_install_dismissed', 'true');
      setIsDismissed(true);
      console.log('App instalada con éxito y banner ocultado.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('pwa_install_dismissed', 'true');
    setIsDismissed(true);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('App instalada con éxito');
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Super admin tiene su propio menú fijo; el resto filtra por rol
  const menuItems = esSuperAdmin
    ? MENU_SUPER_ADMIN
    : MENU_IE.filter(item => !item.roles || item.roles.includes(esAdmin ? 'admin' : ''));

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white border border-slate-200 rounded-md text-slate-500 shadow-sm"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={clsx(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo (No desplazable) */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-1 border border-slate-200 rounded shadow-sm">
              <img src="/logo.png" alt="Skill Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Skill</span>
          </Link>
        </div>

        {/* Contexto de IE (No desplazable) */}
        {ie && (
          <div className="px-6 py-2.5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{ie.nombre}</p>
            {ie.ugel && <p className="text-[9px] text-slate-400 truncate mt-0.5">{ie.ugel}</p>}
          </div>
        )}
        {esSuperAdmin && (
          <div className="px-6 py-2.5 border-b border-slate-100 bg-[#4f46e5]/5 flex-shrink-0">
            <p className="text-[10px] font-bold text-[#4f46e5] uppercase tracking-widest">Super Admin</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Todas las instituciones</p>
          </div>
        )}

        {/* Contenido Desplazable (Navegación + Promoción PWA) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <nav className="px-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all rounded-md group",
                  isActive(item.path)
                    ? "bg-[#4f46e5]/5 text-[#4f46e5]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={clsx(
                  "w-4 h-4 transition-colors",
                  isActive(item.path) ? "text-[#4f46e5]" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Banner de Instalación PWA */}
          {!isStandalone && !isDismissed && (
            <div className="px-4 space-y-3">
              {isInstallable && (
                <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl flex flex-col gap-2 relative group/banner">
                  {/* Botón de Cerrar */}
                  <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                    title="Ocultar invitación"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[9px] font-black text-indigo-900 uppercase tracking-widest leading-none pr-6">
                    App disponible
                  </p>
                  <p className="text-[9px] text-slate-500 leading-normal font-bold">
                    Instala Skill en tu escritorio o móvil para un acceso rápido sin navegador.
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Instalar Aplicación
                  </button>
                </div>
              )}

              {isIOS && (
                <div className="p-3.5 bg-indigo-50/30 border border-indigo-100/30 rounded-xl flex flex-col gap-1.5 relative">
                  {/* Botón de Cerrar */}
                  <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                    title="Ocultar invitación"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[9px] font-black text-indigo-900 uppercase tracking-widest leading-none pr-6">
                    📱 Instalar en tu iPhone
                  </p>
                  <p className="text-[9.5px] text-slate-500 leading-relaxed font-semibold">
                    Pulsa el botón de <span className="text-slate-700 font-bold">Compartir</span> en Safari y luego selecciona <span className="text-[#4f46e5] font-bold">"Añadir a la pantalla de inicio"</span>.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer usuario (Anclado al fondo gracias a Flexbox, sin superposiciones) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            <div className="w-8 h-8 rounded-md bg-[#4f46e5]/10 border border-[#4f46e5]/20 flex items-center justify-center text-[#4f46e5] font-bold text-xs">
              {perfil?.nombre?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{perfil?.nombre || 'Usuario'}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{perfil?.rol || 'Invitado'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500/70 hover:text-red-600 hover:bg-red-50 rounded-md transition-all group cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
