import { useState } from 'react';
import { clsx } from 'clsx';
import { useMonitoreos } from '../hooks/useMonitoreos';
import { usePeriodos } from '../hooks/usePeriodos';
import { useDocentes } from '../hooks/useDocentes';
import ResumenCards from '../components/dashboard/ResumenCards';
import GraficoDonaItem from '../components/dashboard/GraficoDonaItem';
import GraficoRadarDesempeno from '../components/dashboard/GraficoRadarDesempeno';
import GraficoRankingNiveles from '../components/dashboard/GraficoRankingNiveles';

import { AREAS } from '../data/areas';
import { GRADOS } from '../data/grados';
import { SECCIONES } from '../data/secciones';
import { 
  Filter, RefreshCcw, CalendarRange, User, 
  ClipboardCheck, TrendingUp as TrendingIcon 
} from 'lucide-react';
import { 
  getDistribucionPorIndicador, 
  getLogroPorIndicador, 
  getRankingDocentes 
} from '../lib/dashboardUtils';

import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { periodos } = usePeriodos();
  const { docentes } = useDocentes();
  const [filters, setFilters] = useState({
    periodo_id: '',
    area: '',
    grado: '',
    seccion: '',
    docente_id: '',
    fechaDesde: '',
    fechaHasta: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const { monitoreos, loading, refresh } = useMonitoreos(filters);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => setFilters({ 
    periodo_id: '', area: '', grado: '', seccion: '', docente_id: '', fechaDesde: '', fechaHasta: '' 
  });

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  const distribucion = getDistribucionPorIndicador(monitoreos);
  const datosRadar = getLogroPorIndicador(monitoreos);
  const datosRanking = getRankingDocentes(monitoreos);

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">Panel de Control</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Análisis pedagógico docente 2026</p>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-sky-50 border border-sky-100 rounded-2xl">
            <div className="p-2 bg-sky-600 rounded-lg shadow-sm">
              <ClipboardCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[18px] font-black text-sky-900 leading-none">{monitoreos.length}</p>
              <p className="text-[9px] font-bold text-sky-600 uppercase tracking-tight mt-0.5">Monitoreos Realizados</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all border",
              showFilters || activeFiltersCount > 0
                ? "bg-sky-50 border-sky-200 text-sky-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden xs:inline">Filtros</span>
            <span className="xs:hidden">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-sky-600 text-white text-[9px] rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => refresh()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-xs md:text-sm"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros Colapsables con Animación */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 32 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Periodo Escolar</label>
                  <div className="relative">
                    <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select name="periodo_id" value={filters.periodo_id} onChange={handleFilterChange} className="input-field py-2 text-sm pl-10">
                      <option value="">Todos los periodos</option>
                      {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Docente</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select name="docente_id" value={filters.docente_id} onChange={handleFilterChange} className="input-field py-2 text-sm pl-10">
                      <option value="">Todos los docentes</option>
                      {docentes.map(d => <option key={d.dni} value={d.dni}>{d.nombre_completo}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Grado</label>
                    <select name="grado" value={filters.grado} onChange={handleFilterChange} className="input-field py-2 text-sm">
                      <option value="">Todos</option>
                      {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Sección</label>
                    <select name="seccion" value={filters.seccion} onChange={handleFilterChange} className="input-field py-2 text-sm">
                      <option value="">Todas</option>
                      {SECCIONES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Área Curricular</label>
                  <select name="area" value={filters.area} onChange={handleFilterChange} className="input-field py-2 text-sm">
                    <option value="">Todas las áreas</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <p className="hidden xs:block text-[9px] text-slate-400 font-bold uppercase italic">Los cambios se aplican automáticamente</p>
                <button onClick={clearFilters} className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors ml-auto">
                  Limpiar filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resumen KPI */}
      <ResumenCards monitoreos={monitoreos} />

      {/* Sección de Gráficos de Dona */}
      <section>
        <div className="flex items-center gap-2 mb-4 md:mb-6">
          <div className="h-4 w-1 bg-sky-600 rounded-full" />
          <h2 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-wider">Desempeño por Indicador</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {distribucion.map((ind, i) => (
            <GraficoDonaItem key={i} indicador={ind} />
          ))}
        </div>
      </section>

      {/* Sección Inferior: Balance y Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1">
          <GraficoRadarDesempeno data={datosRadar} />
        </div>
        <div className="lg:col-span-2">
          <GraficoRankingNiveles data={datosRanking} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
