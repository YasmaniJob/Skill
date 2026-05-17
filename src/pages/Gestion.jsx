import { useState } from 'react';
import CargaDocentes from '../components/gestion/CargaDocentes';
import CargaPerfiles from '../components/gestion/CargaPerfiles';
import { Users, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

const Gestion = () => {
  const [activeTab, setActiveTab] = useState('docentes');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personal</h1>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('docentes')}
          className={clsx(
            'px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors',
            activeTab === 'docentes' 
              ? 'border-[#4f46e5] text-[#4f46e5] bg-[#4f46e5]/5' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          )}
        >
          <Users className="w-4 h-4" /> Padrón de Docentes
        </button>
        <button
          onClick={() => setActiveTab('perfiles')}
          className={clsx(
            'px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors',
            activeTab === 'perfiles' 
              ? 'border-[#4f46e5] text-[#4f46e5] bg-[#4f46e5]/5' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          )}
        >
          <ShieldCheck className="w-4 h-4" /> Perfiles y Accesos
        </button>
      </div>

      <div className="pt-4">
        {activeTab === 'docentes' ? <CargaDocentes /> : <CargaPerfiles />}
      </div>
    </div>
  );
};

export default Gestion;
