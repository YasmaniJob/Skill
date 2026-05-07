import { useState } from 'react';
import { useMonitoreos } from '../hooks/useMonitoreos';
import ExportarExcel from '../components/reportes/ExportarExcel';
import ExportarPDF from '../components/reportes/ExportarPDF';
import { AREAS } from '../data/areas';
import { FileBarChart, Filter, Info, Calendar, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import Select from 'react-select';
import { usePeriodos } from '../hooks/usePeriodos';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';

const Reportes = () => {
  const { periodos } = usePeriodos();
  const [filters, setFilters] = useState({
    periodo_id: '',
    area: '',
    fechaDesde: '',
    fechaHasta: '',
  });

  const { monitoreos, loading } = useMonitoreos(filters);

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
      padding: '4px',
      boxShadow: 'none',
      '&:hover': { borderColor: '#4f46e5' }
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? '#4f46e5' : isFocused ? '#f1f5f9' : 'white',
      color: isSelected ? 'white' : '#1e293b',
      fontSize: '13px',
      fontWeight: '700',
      cursor: 'pointer'
    }),
    singleValue: (base) => ({ ...base, color: '#1e293b', fontWeight: '700' })
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reportes y Exportación</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Generación de documentos oficiales del monitoreo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Sidebar de Configuración */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-4 w-1 bg-indigo-600 rounded-full" />
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Configurar Reporte</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Periodo Escolar</label>
                <Select
                  options={periodoOptions}
                  value={periodoOptions.find(o => o.value === filters.periodo_id)}
                  onChange={(opt) => setFilters(prev => ({ ...prev, periodo_id: opt?.value || '' }))}
                  styles={customSelectStyles}
                  placeholder="Seleccionar..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Área Curricular</label>
                <Select
                  options={areaOptions}
                  value={areaOptions.find(o => o.value === filters.area)}
                  onChange={(opt) => setFilters(prev => ({ ...prev, area: opt?.value || '' }))}
                  styles={customSelectStyles}
                  placeholder="Seleccionar..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-indigo-600" /> Fecha Desde
                </label>
                <DatePicker
                  selected={filters.fechaDesde ? new Date(filters.fechaDesde + 'T12:00:00') : null}
                  onChange={(date) => setFilters(prev => ({ ...prev, fechaDesde: date ? date.toISOString().split('T')[0] : '' }))}
                  locale={es}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccionar fecha..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                  wrapperClassName="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-indigo-600" /> Fecha Hasta
                </label>
                <DatePicker
                  selected={filters.fechaHasta ? new Date(filters.fechaHasta + 'T12:00:00') : null}
                  onChange={(date) => setFilters(prev => ({ ...prev, fechaHasta: date ? date.toISOString().split('T')[0] : '' }))}
                  locale={es}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccionar fecha..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                  wrapperClassName="w-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex gap-4">
            <Info className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <div className="text-[11px] text-indigo-900 leading-relaxed font-bold uppercase tracking-tight">
              Los documentos generados incluirán únicamente los registros que coincidan con los filtros activos.
            </div>
          </div>
        </div>

        {/* Panel de Generación Pro */}
        <div className="lg:col-span-3">
          <div className="bg-white p-12 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-10 min-h-[500px]">
            <div className="relative">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                <FileBarChart className="w-10 h-10 text-indigo-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Datos Sincronizados</h2>
              <p className="text-sm font-bold text-slate-400">
                Se han identificado <span className="text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded mx-1">{monitoreos.length} registros</span> listos para ser procesados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <ExportarExcel monitoreos={monitoreos} />
              <ExportarPDF monitoreos={monitoreos} />
            </div>

            <div className="flex flex-col items-center gap-2 max-w-lg">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                El formato Excel incluye una hoja de resumen estadístico por indicador.<br/>
                El formato PDF genera el documento oficial apto para impresión institucional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
