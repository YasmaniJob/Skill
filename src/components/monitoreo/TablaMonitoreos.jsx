import { useState, useMemo } from 'react';
import { useMonitoreos } from '../../hooks/useMonitoreos';
import { useAuth } from '../../hooks/useAuth.jsx';
import { usePeriodos } from '../../hooks/usePeriodos';
import { NIVELES } from '../../data/indicadores';
import { AREAS } from '../../data/areas';
import { Trash2, Search, CalendarRange, Filter, ChevronLeft, ChevronRight, MoreHorizontal, User } from 'lucide-react';
import Select from 'react-select';
import { clsx } from 'clsx';

const NIVEL_COLORS = {
  1: 'bg-rose-600 text-white border-rose-700',
  2: 'bg-amber-500 text-white border-amber-600',
  3: 'bg-blue-600 text-white border-blue-700',
  4: 'bg-emerald-600 text-white border-emerald-700',
};

const TablaMonitoreos = () => {
  const { periodos } = usePeriodos();
  const [filters, setFilters] = useState({ nombre: '', area: '', periodo_id: '' });
  const { monitoreos, loading, deleteMonitoreo } = useMonitoreos(filters);
  const { user, esAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const periodoOptions = [
    { value: '', label: 'Todos los periodos' },
    ...periodos.map(p => ({ value: p.id, label: p.nombre }))
  ];

  const areaOptions = [
    { value: '', label: 'Todas las áreas' },
    ...AREAS.map(a => ({ value: a, label: a }))
  ];

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderRadius: '0.5rem',
      padding: '2px',
      minWidth: '200px',
      boxShadow: 'none',
      '&:hover': { borderColor: '#4f46e5' }
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? '#4f46e5' : isFocused ? '#f1f5f9' : 'white',
      color: isSelected ? 'white' : '#1e293b',
      fontSize: '12px',
      fontWeight: '700',
      cursor: 'pointer'
    }),
    singleValue: (base) => ({ ...base, color: '#1e293b', fontWeight: '700', fontSize: '12px' })
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return monitoreos.slice(start, start + itemsPerPage);
  }, [monitoreos, currentPage]);

  const totalPages = Math.ceil(monitoreos.length / itemsPerPage);

  const IndicatorBadge = ({ value }) => {
    if (!value) return <span className="text-slate-200">—</span>;
    return (
      <div className={clsx(
        'w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-black mx-auto border shadow-sm transition-transform hover:scale-110',
        NIVEL_COLORS[value]
      )}>
        {value}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filtros Bar Premium */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <input
            type="text"
            placeholder="Buscar docente por nombre o DNI..."
            value={filters.nombre}
            onChange={(e) => { setFilters(prev => ({ ...prev, nombre: e.target.value })); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <Select
              options={periodoOptions}
              value={periodoOptions.find(o => o.value === filters.periodo_id)}
              onChange={(opt) => { setFilters(prev => ({ ...prev, periodo_id: opt?.value || '' })); setCurrentPage(1); }}
              styles={customSelectStyles}
              placeholder="Periodo..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <Select
              options={areaOptions}
              value={areaOptions.find(o => o.value === filters.area)}
              onChange={(opt) => { setFilters(prev => ({ ...prev, area: opt?.value || '' })); setCurrentPage(1); }}
              styles={customSelectStyles}
              placeholder="Área..."
            />
          </div>
        </div>
      </div>

      {/* Tabla Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Fecha</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Docente</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Área / Grado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Periodo</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] text-center">I1</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] text-center">I2</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] text-center">I3</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] text-center">I4</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] text-center">I5</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] text-center">Promedio</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="11" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Sincronizando registros...</td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan="11" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">No se encontraron resultados</td></tr>
              ) : (
                paginatedData.map(m => {
                  const scores = [m.involucra_estudiantes, m.promueve_razonamiento, m.evalua_progreso, m.propicia_ambiente, m.regula_comportamiento];
                  const prom = scores.reduce((a, b) => a + b, 0) / 5;
                  const promBg = prom >= 3.5 ? 'bg-emerald-50 text-emerald-700' : prom >= 2.5 ? 'bg-blue-50 text-blue-700' : prom >= 1.5 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700';
                  const canDelete = esAdmin || (user && m.registrado_por === user.id);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-black text-slate-900">{new Date(m.fecha + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{new Date(m.fecha + 'T12:00:00').getFullYear()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{m.nombre_docente}</span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">DNI {m.dni_docente}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight truncate max-w-[180px]">{m.area}</span>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{m.grado} – {m.seccion}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-black px-2 py-1 rounded uppercase tracking-tighter">
                          {m.periodo?.nombre ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-5"><IndicatorBadge value={m.involucra_estudiantes} /></td>
                      <td className="px-4 py-5"><IndicatorBadge value={m.promueve_razonamiento} /></td>
                      <td className="px-4 py-5"><IndicatorBadge value={m.evalua_progreso} /></td>
                      <td className="px-4 py-5"><IndicatorBadge value={m.propicia_ambiente} /></td>
                      <td className="px-4 py-5"><IndicatorBadge value={m.regula_comportamiento} /></td>
                      <td className="px-8 py-5 text-center">
                        <div className={clsx('inline-block px-3 py-1.5 rounded-md text-sm font-black min-w-[50px]', promBg)}>
                          {prom.toFixed(1)}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {canDelete && (
                          <button
                            onClick={() => { if(window.confirm('¿Eliminar este registro?')) deleteMonitoreo(m.id); }}
                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagos Pro */}
        {totalPages > 1 && (
          <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft className="w-3 h-3" /> Ant.
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
              >
                Sig. <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TablaMonitoreos;
