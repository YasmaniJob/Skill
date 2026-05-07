import { useState, useMemo } from 'react';
import { useMonitoreos } from '../../hooks/useMonitoreos';
import { useAuth } from '../../hooks/useAuth.jsx';
import { usePeriodos } from '../../hooks/usePeriodos';
import { NIVELES } from '../../data/indicadores';
import { AREAS } from '../../data/areas';
import { Trash2, Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal, CalendarRange } from 'lucide-react';
import { clsx } from 'clsx';

const TablaMonitoreos = () => {
  const { periodos } = usePeriodos();
  const [filters, setFilters] = useState({ nombre: '', area: '', periodo_id: '' });
  const { monitoreos, loading, deleteMonitoreo } = useMonitoreos(filters);
  const { user, esAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return monitoreos.slice(start, start + itemsPerPage);
  }, [monitoreos, currentPage]);

  const totalPages = Math.ceil(monitoreos.length / itemsPerPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const IndicatorBadge = ({ value }) => {
    if (!value) return <span className="text-slate-200">—</span>;
    const nivel = NIVELES[value];
    const fill = nivel.color.replace('bg-', 'bg-').replace('600', '100').replace('500', '100');
    const border = nivel.border.replace('border-', 'border-').replace('500', '200').replace('600', '200');
    const text = nivel.color.replace('bg-', 'text-').replace('100', '600').replace('200', '600');
    
    return (
      <div
        className={clsx(
          'w-7 h-7 rounded border flex items-center justify-center text-[10px] font-bold mx-auto',
          fill, border, text
        )}
        title={nivel.etiqueta}
      >
        {value}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filtros Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input
            type="text"
            name="nombre"
            placeholder="Buscar docente..."
            value={filters.nombre}
            onChange={handleFilterChange}
            className="input-field pl-10"
          />
        </div>
        <div className="relative min-w-[200px]">
          <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <select
            name="periodo_id"
            value={filters.periodo_id}
            onChange={handleFilterChange}
            className="input-field pl-10"
          >
            <option value="">Todos los periodos</option>
            {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <select
            name="area"
            value={filters.area}
            onChange={handleFilterChange}
            className="input-field pl-10"
          >
            <option value="">Todas las áreas</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Tabla Container */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Docente</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Área / Grado</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periodo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">I1</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">I2</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">I3</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">I4</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">I5</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">PROM</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="11" className="px-6 py-12 text-center text-slate-400 font-medium">Cargando base de datos...</td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan="11" className="px-6 py-12 text-center text-slate-400 font-medium italic">No se encontraron registros</td></tr>
              ) : (
                paginatedData.map(m => {
                  const prom = ((m.involucra_estudiantes + m.promueve_razonamiento + m.evalua_progreso + m.propicia_ambiente + m.regula_comportamiento) / 5);
                  const promColor = prom >= 3.5 ? 'text-emerald-600' : prom >= 2.5 ? 'text-blue-600' : prom >= 1.5 ? 'text-amber-600' : 'text-red-600';
                  const canDelete = esAdmin || (user && m.registrado_por === user.id);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4 text-[13px] text-slate-500 font-medium whitespace-nowrap">
                        {new Date(m.fecha + 'T12:00:00').toLocaleDateString('es-PE')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-900 group-hover:text-[#4f46e5] transition-colors">{m.nombre_docente}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">DNI: {m.dni_docente}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-600 truncate max-w-[180px]" title={m.area}>{m.area}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{m.grado} – {m.seccion}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] text-slate-400 font-bold uppercase">
                          {m.periodo?.nombre ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center"><IndicatorBadge value={m.involucra_estudiantes} /></td>
                      <td className="px-6 py-4 text-center"><IndicatorBadge value={m.promueve_razonamiento} /></td>
                      <td className="px-6 py-4 text-center"><IndicatorBadge value={m.evalua_progreso} /></td>
                      <td className="px-6 py-4 text-center"><IndicatorBadge value={m.propicia_ambiente} /></td>
                      <td className="px-6 py-4 text-center"><IndicatorBadge value={m.regula_comportamiento} /></td>
                      <td className={clsx('px-6 py-4 text-center text-sm font-bold', promColor)}>
                        {prom.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canDelete ? (
                          <button
                            onClick={() => deleteMonitoreo(m.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                            title="Eliminar Registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <MoreHorizontal className="w-4 h-4 text-slate-200" />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              Pagina {currentPage} de {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-300 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-300 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TablaMonitoreos;
