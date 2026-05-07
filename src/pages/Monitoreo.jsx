import { useState, useEffect } from 'react';
import FormularioMonitoreo from '../components/monitoreo/FormularioMonitoreo';
import { usePeriodos } from '../hooks/usePeriodos';
import { CalendarRange } from 'lucide-react';
import Select from 'react-select';

const Monitoreo = () => {
  const { periodosActivos } = usePeriodos();
  const [periodoId, setPeriodoId] = useState('');

  const periodoOptions = periodosActivos.map(p => ({
    value: p.id,
    label: p.nombre
  }));

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

        {/* Periodo en el Header - Premium Select */}
        <div className="flex flex-col gap-1.5 min-w-[240px]">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <CalendarRange className="w-3 h-3 text-indigo-600" /> Periodo Activo
          </label>
          <Select 
            options={periodoOptions}
            value={periodoOptions.find(o => o.value === periodoId)}
            onChange={(opt) => setPeriodoId(opt?.value || '')}
            placeholder="Seleccionar periodo..."
            className="text-sm font-bold"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.5rem',
                padding: '2px',
                boxShadow: 'none',
                '&:hover': { borderColor: '#4f46e5' }
              }),
              option: (base, { isFocused, isSelected }) => ({
                ...base,
                backgroundColor: isSelected ? '#4f46e5' : isFocused ? '#f1f5f9' : 'white',
                color: isSelected ? 'white' : '#1e293b',
                fontSize: '13px',
                fontWeight: '700'
              }),
              menu: (base) => ({
                ...base,
                zIndex: 100
              })
            }}
          />
        </div>
      </div>
      
      <div className="w-full">
        <FormularioMonitoreo externalPeriodoId={periodoId} />
      </div>
    </div>
  );
};

export default Monitoreo;
