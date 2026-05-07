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
  ClipboardCheck
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
    <div className="space-y-8 pb-12 text-[#eeeeee]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">Panel de Control</h1>
            <p className="text-slate-500 font-medium text-xs mt-1 uppercase tracking-widest">Análisis pedagógico docente 2026</p>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-md">
            <div className="p-2 bg-[#5e6ad2]/20 rounded text-[#5e6ad2]">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-white leading-none">{monitoreos.length}</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight mt-1">Registros Totales</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-md font-medium text-xs transition-all border",
              showFilters || activeFiltersCount > 0
                ? "bg-[#5e6ad2]/10 border-[#5e6ad2]/30 text-[#5e6ad2]"
                : "bg-[#121316] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#5e6ad2] text-white text-[9px] rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => refresh()}
            className="flex items-center gap-2 px-4 py-2 bg-[#121316] border border-white/10 rounded-md text-slate-400 hover:text-white hover:border-white/20 transition-all font-medium text-xs"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros Colapsables */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-[#121316] p-6 rounded-lg border border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Periodo</label>
                  <div className="relative">
                    <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <select name="periodo_id" value={filters.periodo_id} onChange={handleFilterChange} className="input-field pl-10">
                      <option value="">Todos</option>
                      {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Docente</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <select name="docente_id" value={filters.docente_id} onChange={handleFilterChange} className="input-field pl-10">
                      <option value="">Todos</option>
                      {docentes.map(d => <option key={d.dni} value={d.dni}>{d.nombre_completo}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Grado</label>
                    <select name="grado" value={filters.grado} onChange={handleFilterChange} className="input-field">
                      <option value="">Todos</option>
                      {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Sección</label>
                    <select name="seccion" value={filters.seccion} onChange={handleFilterChange} className="input-field">
                      <option value="">Todas</option>
                      {SECCIONES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Área</label>
                  <select name="area" value={filters.area} onChange={handleFilterChange} className="input-field">
                    <option value="">Todas</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end items-center border-t border-white/5 pt-4">
                <button onClick={clearFilters} className="text-[10px] font-bold text-red-400/60 hover:text-red-400 uppercase tracking-widest transition-colors">
                  Limpiar filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Section */}
      <ResumenCards monitoreos={monitoreos} />

      {/* Indicadores Grid */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-4 w-1 bg-[#5e6ad2] rounded-full" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Indicadores de Desempeño</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {distribucion.map((ind, i) => (
            <GraficoDonaItem key={i} indicador={ind} />
          ))}
        </div>
      </section>

      {/* Balance & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
