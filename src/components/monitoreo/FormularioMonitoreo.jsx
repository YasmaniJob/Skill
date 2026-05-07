import { useState, useEffect } from 'react';
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
  1: 'shadow-[0_0_15px_rgba(239,68,68,0.05)] border-red-500/20',
  2: 'shadow-[0_0_15px_rgba(245,158,11,0.05)] border-amber-500/20',
  3: 'shadow-[0_0_15px_rgba(59,130,246,0.05)] border-blue-500/20',
  4: 'shadow-[0_0_15px_rgba(16,185,129,0.05)] border-emerald-500/20',
};

const FormularioMonitoreo = ({ externalPeriodoId }) => {
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

  // Sincronizar con el periodo del Header
  useEffect(() => {
    if (externalPeriodoId) {
      setFormData(prev => ({ ...prev, periodo_id: externalPeriodoId }));
    }
  }, [externalPeriodoId]);

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
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-slate-900 shadow-none">
      <form onSubmit={handleSubmit} className="p-10 space-y-12">
        {/* Info Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/[0.01] p-6 border border-white/5 rounded-lg">
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
                  backgroundColor: '#ffffff',
                  borderColor: '#e5e7eb',
                  borderRadius: '0.375rem',
                  color: '#111827',
                  '&:hover': { borderColor: '#d1d5db' }
                }),
                menu: (base) => ({ ...base, backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }),
                option: (base, { isFocused }) => ({ ...base, backgroundColor: isFocused ? '#4f46e5' : 'transparent', color: isFocused ? 'white' : '#111827' }),
                singleValue: (base) => ({ ...base, color: '#111827' }),
                input: (base) => ({ ...base, color: '#111827' })
              }}
              value={formData.dni_docente ? docenteOptions.find(o => o.value === formData.dni_docente) : null}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Fecha de Observación
            </label>
            <input type="date" name="fecha" required value={formData.fecha} onChange={handleInputChange} className="input-field" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-3 h-3" /> Área Curricular
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
            <div className="h-4 w-1 bg-[#4f46e5] rounded-full" />
            <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-[0.2em]">Rúbricas de Desempeño</h3>
          </div>

          <div className="space-y-10">
            {INDICADORES.map((ind, idx) => (
              <div key={ind.id} className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 text-xs font-bold text-slate-600 mt-0.5">0{idx + 1}</span>
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed">{ind.nombre}</p>
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
                            ? `${NIVELES[valor].color.replace('bg-', 'bg-').replace('600', '500/10')} ${NIVELES[valor].border.replace('border-', 'border-').replace('500', '500/40')} text-slate-900 ring-1 ring-[#4f46e5]/20 ${NIVEL_GLOW[valor]}`
                            : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                        )}
                      >
                        <span className={clsx("text-xl font-bold", isSelected ? "text-slate-900" : "text-slate-300")}>{valor}</span>
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
