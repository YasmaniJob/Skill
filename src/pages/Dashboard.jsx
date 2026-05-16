import { useState } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useMonitoreos } from '../hooks/useMonitoreos';
import { usePeriodos } from '../hooks/usePeriodos';
import { useDocentes } from '../hooks/useDocentes';
import ResumenCards from '../components/dashboard/ResumenCards';
import GraficoDonaItem from '../components/dashboard/GraficoDonaItem';
import GraficoRadarDesempeno from '../components/dashboard/GraficoRadarDesempeno';
import GraficoRankingNiveles from '../components/dashboard/GraficoRankingNiveles';
import DashboardSuperAdmin from './DashboardSuperAdmin';

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
  const { esSuperAdmin } = useAuth();

  // El super_admin tiene su propio dashboard
  if (esSuperAdmin) return <DashboardSuperAdmin />;

  return <DashboardIE />;
};

const DashboardIE = () => {
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
    <div className="space-y-8 pb-12 text-slate-900">
      {/* Header Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Panel de Control</h1>
            <p className="text-slate-400 font-bold text-[9px] mt-1 uppercase tracking-widest">Análisis Pedagógico {new Date().getFullYear()}</p>
          </div>
          
          <div className="flex items-center gap-3 px-3 py-1.5 bg-white border border-slate-200 rounded-lg">
            <div className="p-1.5 bg-[#4f46e5]/10 text-[#4f46e5] rounded">
              <ClipboardCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-none">{monitoreos.length}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Monitoreos</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 font-black text-[11px] uppercase tracking-widest transition-all border border-slate-200 rounded-l-lg",
              showFilters || activeFiltersCount > 0
                ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                : "bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white text-[#4f46e5] text-[10px] font-black rounded">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => refresh()}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-l-0 border-slate-200 text-slate-500 hover:text-slate-900 transition-all font-black text-[11px] uppercase tracking-widest rounded-r-lg"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros Compact */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Periodo</label>
                  <select name="periodo_id" value={filters.periodo_id} onChange={handleFilterChange} className="input-field">
                    <option value="">Todos los periodos</option>
                    {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Docente</label>
                  <select name="docente_id" value={filters.docente_id} onChange={handleFilterChange} className="input-field">
                    <option value="">Todos los docentes</option>
                    {docentes.map(d => <option key={d.dni} value={d.dni}>{d.nombre_completo}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grado</label>
                    <select name="grado" value={filters.grado} onChange={handleFilterChange} className="input-field">
                      <option value="">Grado</option>
                      {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sec.</label>
                    <select name="seccion" value={filters.seccion} onChange={handleFilterChange} className="input-field">
                      <option value="">Sec.</option>
                      {SECCIONES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Área</label>
                  <select name="area" value={filters.area} onChange={handleFilterChange} className="input-field">
                    <option value="">Todas las áreas</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResumenCards monitoreos={monitoreos} />

      {/* Metrics Section Compact */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-3 w-1 bg-slate-900 rounded-full" />
          <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Métricas por Indicador</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {distribucion.map((ind, i) => (
            <GraficoDonaItem key={i} indicador={ind} />
          ))}
        </div>
      </section>

      {/* Radar & Ranking Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-slate-200">
          <GraficoRadarDesempeno data={datosRadar} />
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200">
          <GraficoRankingNiveles data={datosRanking} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
