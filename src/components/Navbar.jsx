import { useAuth } from '../hooks/useAuth.jsx';
import { 
  Bell, Search, Settings, 
  ChevronDown, HelpCircle, Command 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { perfil } = useAuth();

  return (
    <nav className="h-16 bg-[#08090a]/80 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md relative group">
        <div className="absolute left-3 flex items-center pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <div className="w-full bg-white/[0.03] border border-white/10 rounded-md py-1.5 pl-10 pr-4 text-xs text-slate-400 group-focus-within:border-white/20 transition-all flex justify-between items-center cursor-pointer">
          <span>Buscar en Skill...</span>
          <div className="flex items-center gap-1 text-[10px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-500">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-white/5">
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-white/5 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#5e6ad2] rounded-full ring-2 ring-[#08090a]"></span>
        </button>
        
        <div className="h-4 w-px bg-white/10 mx-2" />

        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="w-7 h-7 rounded-md bg-[#5e6ad2] flex items-center justify-center text-white font-bold text-[10px] shadow-lg shadow-indigo-500/20">
            {perfil?.nombre_completo?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-white leading-none">{perfil?.nombre_completo?.split(' ')[0]}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">{perfil?.rol}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
