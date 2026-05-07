import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  LayoutDashboard, ClipboardList, ListChecks,
  FileBarChart, LogOut, Monitor, CalendarRange, Users,
  ChevronRight, Menu, X
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const ROL_LABELS = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700' },
  director: { label: 'Director', color: 'bg-sky-100 text-sky-700' },
  subdirector: { label: 'Subdirector', color: 'bg-blue-100 text-blue-700' },
  coordinador: { label: 'Coordinador', color: 'bg-teal-100 text-teal-700' },
};

const Sidebar = () => {
  const { logout, user, rol, esDirectivo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); }
    catch (error) { console.error('Error logging out:', error); }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, show: true },
    { name: 'Nuevo Registro', path: '/nuevo', icon: ClipboardList, show: true },
    { name: 'Registros', path: '/registros', icon: ListChecks, show: true },
    { name: 'Periodos', path: '/periodos', icon: CalendarRange, show: esDirectivo },
    { name: 'Gestión', path: '/gestion', icon: Users, show: esDirectivo },
    { name: 'Reportes', path: '/reportes', icon: FileBarChart, show: true },
  ];

  const rolInfo = ROL_LABELS[rol] ?? { label: 'Sin rol', color: 'bg-slate-100 text-slate-500' };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 group">
          <div className="p-2 bg-sky-600 rounded-xl group-hover:bg-sky-700 transition-colors">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">MonitorED</span>
        </Link>
        <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.filter(i => i.show).map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={clsx(
              'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200',
              location.pathname === item.path
                ? 'bg-sky-50 text-sky-700'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={clsx('w-5 h-5', location.pathname === item.path ? 'text-sky-600' : 'text-slate-400')} />
              {item.name}
            </div>
            {location.pathname === item.path && <ChevronRight className="w-4 h-4" />}
          </Link>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-slate-100 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold flex-shrink-0">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{user?.email?.split('@')[0]}</p>
            <span className={clsx('text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider', rolInfo.color)}>
              {rolInfo.label}
            </span>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-600 rounded-lg">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-slate-800 tracking-tight">MonitorED</span>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-200"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex-col z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-72 bg-white flex flex-col z-[70] lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
