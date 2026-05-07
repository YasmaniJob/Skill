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
    return (
      <div
        className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold mx-auto',
          nivel.color
        )}
        title={nivel.etiqueta}
      >
        {value}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            name="nombre"
            placeholder="Buscar docente..."
            value={filters.nombre}
            onChange={handleFilterChange}
            className="input-field pl-10"
          />
        </div>
        <div className="relative min-w-[180px]">
          <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Docente</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Área / Grado</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Periodo</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">I1</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">I2</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">I3</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">I4</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">I5</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Prom</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acc.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="11" className="px-6 py-12 text-center text-slate-400">Cargando registros...</td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan="11" className="px-6 py-12 text-center text-slate-400">No se encontraron registros</td></tr>
              ) : (
                paginatedData.map(m => {
                  const prom = ((m.involucra_estudiantes + m.promueve_razonamiento + m.evalua_progreso + m.propicia_ambiente + m.regula_comportamiento) / 5);
                  const promColor = prom >= 3.5 ? 'text-green-700' : prom >= 2.5 ? 'text-blue-700' : prom >= 1.5 ? 'text-orange-600' : 'text-red-600';
                  const canDelete = esAdmin || (user && m.registrado_por === user.id);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">
                        {new Date(m.fecha + 'T12:00:00').toLocaleDateString('es-PE')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 whitespace-nowrap">{m.nombre_docente}</span>
                          <span className="text-xs text-slate-400">DNI: {m.dni_docente}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full block w-fit max-w-[160px] truncate" title={m.area}>
                          {m.area}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 block">{m.grado} – {m.seccion}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {m.periodo?.nombre ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center"><IndicatorBadge value={m.involucra_estudiantes} /></td>
                      <td className="px-4 py-3 text-center"><IndicatorBadge value={m.promueve_razonamiento} /></td>
                      <td className="px-4 py-3 text-center"><IndicatorBadge value={m.evalua_progreso} /></td>
                      <td className="px-4 py-3 text-center"><IndicatorBadge value={m.propicia_ambiente} /></td>
                      <td className="px-4 py-3 text-center"><IndicatorBadge value={m.regula_comportamiento} /></td>
                      <td className={clsx('px-4 py-3 text-center text-sm font-bold', promColor)}>
                        {prom.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canDelete ? (
                          <button
                            onClick={() => deleteMonitoreo(m.id)}
                            className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <MoreHorizontal className="w-4 h-4 text-slate-200 mx-auto" />
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
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {monitoreos.length} registros · Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all"
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
