import { useState } from 'react';
import { usePeriodos } from '../../hooks/usePeriodos';
import { useMonitoreos } from '../../hooks/useMonitoreos';
import { useDocentes } from '../../hooks/useDocentes';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import { AREAS } from '../../data/areas';
import { GRADOS } from '../../data/grados';
import { SECCIONES } from '../../data/secciones';
import { INDICADORES, NIVELES } from '../../data/indicadores';
import {
  Save, User, Calendar, BookOpen,
  GraduationCap, Users, Loader2, ClipboardList,
  CalendarRange, AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

const NIVEL_GLOW = {
  1: 'shadow-[0_0_15px_rgba(239,68,68,0.1)] border-red-500/30',
  2: 'shadow-[0_0_15px_rgba(245,158,11,0.1)] border-amber-500/30',
  3: 'shadow-[0_0_15px_rgba(59,130,246,0.1)] border-blue-500/30',
  4: 'shadow-[0_0_15px_rgba(16,185,129,0.1)] border-emerald-500/30',
};

const FormularioMonitoreo = () => {
  const { periodosActivos, loading: loadingPeriodos } = usePeriodos();
  const { addMonitoreo } = useMonitoreos();
  const { docentes, loading: loadingDocentes } = useDocentes();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const docenteOptions = docentes.map(d => ({
    value: d.dni,
    label: `${d.dni} - ${d.nombre_completo}`,
    docente: d
  }));

  const handleDocenteSelect = (selectedOption) => {
    if (selectedOption) {
      setFormData(prev => ({
        ...prev,
        dni_docente: selectedOption.docente.dni,
        nombre_docente: selectedOption.docente.nombre_completo,
        area: selectedOption.docente.area_principal || prev.area
      }));
    } else {
      setFormData(prev => ({ ...prev, dni_docente: '', nombre_docente: '' }));
    }
  };

  const emptyForm = {
    periodo_id: '',
    fecha: new Date().toISOString().split('T')[0],
    dni_docente: '',
    nombre_docente: '',
    area: '',
    grado: '',
    seccion: '',
    involucra_estudiantes: 0,
    promueve_razonamiento: 0,
    evalua_progreso: 0,
    propicia_ambiente: 0,
    regula_comportamiento: 0,
    observaciones: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIndicatorChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allScored = INDICADORES.every(ind => formData[ind.id] > 0);
    if (!allScored) {
      toast.error('Por favor califique todos los indicadores.');
      return;
    }
    setIsSubmitting(true);
    const success = await addMonitoreo(formData);
    if (success) {
      setFormData({ ...emptyForm, fecha: new Date().toISOString().split('T')[0] });
    }
    setIsSubmitting(false);
  };

  if (!loadingPeriodos && periodosActivos.length === 0) {
    return (
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-8 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-amber-500 text-lg">No hay periodos activos</h3>
          <p className="text-amber-500/70 mt-1 text-sm">
            Un administrador debe activar un periodo antes de registrar observaciones.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121316] rounded-lg border border-white/10 overflow-hidden text-[#eeeeee]">
      <div className="p-8 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-[#5e6ad2]" />
          Nuevo Registro de Monitoreo
        </h2>
        <p className="text-sm text-slate-500 mt-1">Ingrese la información detallada de la sesión observada.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-10">
        {/* Info Box */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white/[0.01] p-6 border border-white/5 rounded-lg">
          <div className="md:col-span-1 space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <CalendarRange className="w-3 h-3" /> Periodo
            </label>
            <select name="periodo_id" required value={formData.periodo_id} onChange={handleInputChange} className="input-field">
              <option value="">Seleccionar...</option>
              {periodosActivos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <User className="w-3 h-3" /> Buscar Docente
            </label>
            <Select
              options={docenteOptions}
              isLoading={loadingDocentes}
              onChange={handleDocenteSelect}
              isClearable
              placeholder="DNI o Nombre..."
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: '#121316',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.375rem',
                  color: '#eeeeee',
                  '&:hover': { borderColor: 'rgba(255, 255, 255, 0.2)' }
                }),
                menu: (base) => ({ ...base, backgroundColor: '#1a1b1e', border: '1px solid rgba(255, 255, 255, 0.1)' }),
                option: (base, { isFocused }) => ({ ...base, backgroundColor: isFocused ? '#5e6ad2' : 'transparent', color: isFocused ? 'white' : '#eeeeee' }),
                singleValue: (base) => ({ ...base, color: '#eeeeee' }),
                input: (base) => ({ ...base, color: '#eeeeee' })
              }}
              value={formData.dni_docente ? docenteOptions.find(o => o.value === formData.dni_docente) : null}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Fecha
            </label>
            <input type="date" name="fecha" required value={formData.fecha} onChange={handleInputChange} className="input-field" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-3 h-3" /> Área
            </label>
            <select name="area" required value={formData.area} onChange={handleInputChange} className="input-field">
              <option value="">Área...</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <GraduationCap className="w-3 h-3" /> Grado
            </label>
            <select name="grado" required value={formData.grado} onChange={handleInputChange} className="input-field">
              <option value="">Grado...</option>
              {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-3 h-3" /> Sección
            </label>
            <select name="seccion" required value={formData.seccion} onChange={handleInputChange} className="input-field">
              <option value="">Sección...</option>
              {SECCIONES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Indicadores */}
        <div className="space-y-12">
          <div className="flex items-center gap-3">
            <div className="h-4 w-1 bg-[#5e6ad2] rounded-full" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Rúbricas de Desempeño</h3>
          </div>

          <div className="space-y-10">
            {INDICADORES.map((ind, idx) => (
              <div key={ind.id} className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 text-xs font-bold text-slate-600 mt-0.5">0{idx + 1}</span>
                  <p className="text-sm font-semibold text-slate-300 leading-relaxed">{ind.nombre}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-8">
                  {[1, 2, 3, 4].map(valor => {
                    const isSelected = formData[ind.id] === valor;
                    return (
                      <button
                        key={valor}
                        type="button"
                        onClick={() => handleIndicatorChange(ind.id, valor)}
                        className={clsx(
                          'flex flex-col items-center p-3 rounded-md border transition-all duration-200',
                          isSelected
                            ? `${NIVELES[valor].color.replace('bg-', 'bg-').replace('600', '500/20')} ${NIVELES[valor].border.replace('border-', 'border-').replace('500', '500/50')} text-white ring-1 ring-[#5e6ad2]/30 ${NIVEL_GLOW[valor]}`
                            : 'border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/10 hover:bg-white/[0.04]'
                        )}
                      >
                        <span className={clsx("text-xl font-bold", isSelected ? "text-white" : "text-slate-600")}>{valor}</span>
                        <span className="text-[9px] uppercase font-bold tracking-widest mt-1 opacity-60">
                          {NIVELES[valor].etiqueta}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Observaciones */}
        <div className="space-y-2 border-t border-white/5 pt-8">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Observaciones Adicionales</label>
          <textarea
            name="observaciones"
            rows={4}
            value={formData.observaciones}
            onChange={handleInputChange}
            className="input-field bg-white/[0.01] resize-none"
            placeholder="Ingrese notas sobre la sesión..."
          />
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary min-w-[240px] py-3 rounded-md flex items-center justify-center gap-3 text-sm"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Finalizar y Guardar</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioMonitoreo;
