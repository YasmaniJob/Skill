import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  LayoutDashboard, ClipboardList, ListChecks,
  FileBarChart, LogOut, Monitor, CalendarRange, Users,
} from 'lucide-react';
import { clsx } from 'clsx';

const ROL_LABELS = {
  admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
  director: { label: 'Director(a)', color: 'bg-sky-100 text-sky-700' },
  subdirector: { label: 'Subdirector(a)', color: 'bg-blue-100 text-blue-700' },
  coordinador: { label: 'Coordinador(a)', color: 'bg-teal-100 text-teal-700' },
};

const Navbar = () => {
  const { logout, user, rol, esDirectivo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group mr-6">
              <div className="p-1.5 bg-sky-600 rounded-lg group-hover:bg-sky-700 transition-colors">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-sky-700 tracking-tight">MonitorED</span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.filter(i => i.show).map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    location.pathname === item.path
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User info + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end">
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full', rolInfo.color)}>
                {rolInfo.label}
              </span>
              <span className="text-xs text-slate-400 mt-0.5">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
