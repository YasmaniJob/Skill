import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  LayoutDashboard, ClipboardList, History, 
  Settings, LogOut, X, Menu, CalendarDays, 
  BarChart3, UserPlus
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

const Sidebar = () => {
  const { logout, perfil, esAdmin, esDirectivo } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ClipboardList, label: 'Nuevo Monitoreo', path: '/nuevo' },
    { icon: History, label: 'Registros', path: '/registros' },
    { icon: BarChart3, label: 'Reportes', path: '/reportes' },
    { icon: CalendarDays, label: 'Periodos', path: '/periodos', roles: ['admin'] },
    { icon: UserPlus, label: 'Gestión Usuarios', path: '/gestion', roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.roles || (item.roles.includes('admin') && esAdmin)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#121316] border border-white/10 rounded-md text-slate-400"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-40 w-64 bg-[#08090a] border-r border-white/10 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Skill Logo" className="w-6 h-6" />
            <span className="text-lg font-semibold tracking-tight text-white">Skill</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4 px-2">Navegación</p>
          {filteredItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all rounded-md group",
                isActive(item.path) 
                  ? "bg-[#5e6ad2]/10 text-[#5e6ad2]" 
                  : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
              )}
            >
              <item.icon className={clsx(
                "w-4 h-4 transition-colors",
                isActive(item.path) ? "text-[#5e6ad2]" : "text-slate-500 group-hover:text-slate-300"
              )} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#08090a]">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            <div className="w-8 h-8 rounded-md bg-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2] font-bold text-xs">
              {perfil?.nombre_completo?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{perfil?.nombre_completo || 'Usuario'}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{perfil?.rol || 'Invitado'}</p>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/5 rounded-md transition-all group"
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
