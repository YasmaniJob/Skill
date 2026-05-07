import { useAuth } from '../hooks/useAuth.jsx';
import { 
  Bell, Search, Settings, 
  ChevronDown, HelpCircle, Command 
} from 'lucide-react';

const Navbar = () => {
  const { perfil } = useAuth();

  return (
    <nav className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md relative group">
        <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <div className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-10 pr-4 text-xs text-slate-500 group-focus-within:border-slate-300 group-focus-within:bg-white transition-all flex justify-between items-center cursor-pointer">
          <span>Buscar en Skill...</span>
          <div className="flex items-center gap-1 text-[10px] font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 shadow-sm">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-md hover:bg-slate-50">
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-md hover:bg-slate-50 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#4f46e5] rounded-full ring-2 ring-white"></span>
        </button>
        
        <div className="h-4 w-px bg-slate-200 mx-2" />

        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="w-7 h-7 rounded bg-[#4f46e5] flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
            {perfil?.nombre_completo?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">{perfil?.nombre_completo?.split(' ')[0]}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{perfil?.rol}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
