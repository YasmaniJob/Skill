import { useState } from 'react';
import { useMonitoreos } from '../hooks/useMonitoreos';
import ExportarExcel from '../components/reportes/ExportarExcel';
import ExportarPDF from '../components/reportes/ExportarPDF';
import { AREAS } from '../data/areas';
import { FileBarChart, Filter, Info } from 'lucide-react';

import { usePeriodos } from '../hooks/usePeriodos';

const Reportes = () => {
  const { periodos } = usePeriodos();
  const [filters, setFilters] = useState({
    periodo_id: '',
    area: '',
    fechaDesde: '',
    fechaHasta: '',
  });

  const { monitoreos, loading } = useMonitoreos(filters);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reportes y Exportación</h1>
        <p className="text-slate-500">Genera documentos oficiales del monitoreo pedagógico.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Filter className="w-4 h-4 text-sky-600" />
              Configurar Reporte
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Periodo de Monitoreo</label>
                <select 
                  name="periodo_id"
                  value={filters.periodo_id}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  <option value="">Todos los periodos</option>
                  {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Área Curricular</label>
                <select 
                  name="area"
                  value={filters.area}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  <option value="">Todas las áreas</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Desde</label>
                <input 
                  type="date" 
                  name="fechaDesde"
                  value={filters.fechaDesde}
                  onChange={handleFilterChange}
                  className="input-field" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Hasta</label>
                <input 
                  type="date" 
                  name="fechaHasta"
                  value={filters.fechaHasta}
                  onChange={handleFilterChange}
                  className="input-field" 
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-1">Nota importante</p>
              <p>Los reportes generados incluirán únicamente los registros que coincidan con los filtros seleccionados.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-2">
              <FileBarChart className="w-10 h-10 text-primary-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Listo para Exportar</h2>
              <p className="text-slate-500 mt-2 max-w-md">
                Se han encontrado <span className="font-bold text-primary-600">{monitoreos.length}</span> registros para los criterios seleccionados.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <div className="flex-1">
                <ExportarExcel monitoreos={monitoreos} />
              </div>
              <div className="flex-1">
                <ExportarPDF monitoreos={monitoreos} />
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-8">
              El formato Excel incluye una hoja de resumen estadístico por indicador.
              El formato PDF es apto para impresión oficial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
