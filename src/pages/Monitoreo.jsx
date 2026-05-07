import { useState, useEffect } from 'react';
import FormularioMonitoreo from '../components/monitoreo/FormularioMonitoreo';
import { usePeriodos } from '../hooks/usePeriodos';
import { CalendarRange } from 'lucide-react';

const Monitoreo = () => {
  const { periodosActivos } = usePeriodos();
  const [periodoId, setPeriodoId] = useState('');

  // Auto-seleccionar periodo activo
  useEffect(() => {
    if (periodosActivos.length > 0 && !periodoId) {
      setPeriodoId(periodosActivos[0].id);
    }
  }, [periodosActivos, periodoId]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Monitorear</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Nueva observación pedagógica en el aula
          </p>
        </div>

        {/* Periodo en el Header */}
        <div className="flex flex-col gap-1.5 min-w-[240px]">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <CalendarRange className="w-3 h-3" /> Periodo Activo
          </label>
          <select 
            value={periodoId} 
            onChange={(e) => setPeriodoId(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:border-[#4f46e5] transition-all"
          >
            <option value="">Seleccionar periodo...</option>
            {periodosActivos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="w-full">
        <FormularioMonitoreo externalPeriodoId={periodoId} />
      </div>
    </div>
  );
};

export default Monitoreo;
