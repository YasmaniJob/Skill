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
  GraduationCap, Users, Loader2, ClipboardCheck,
  CalendarRange, AlertCircle, MessageSquare
} from 'lucide-react';
import { clsx } from 'clsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';



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

  useEffect(() => {
    if (externalPeriodoId) {
      setFormData(prev => ({ ...prev, periodo_id: externalPeriodoId }));
    }
  }, [externalPeriodoId]);

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
      setFormData({ ...emptyForm, fecha: new Date().toISOString().split('T')[0], periodo_id: externalPeriodoId });
      toast.success('Monitoreo registrado con éxito');
    }
    setIsSubmitting(false);
  };
  const areaOptions = AREAS.map(a => ({ value: a, label: a }));
  const gradoOptions = GRADOS.map(g => ({ value: g, label: g }));
  const seccionOptions = SECCIONES.map(s => ({ value: s, label: s }));

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      padding: '4px',
      borderColor: '#e2e8f0',
      borderRadius: '0.5rem',
      boxShadow: 'none',
      backgroundColor: '#ffffff',
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
    singleValue: (base) => ({ ...base, color: '#1e293b', fontWeight: '700' }),
    placeholder: (base) => ({ ...base, color: '#94a3b8' }),
    menu: (base) => ({ ...base, zIndex: 50 })
  };

  if (!loadingPeriodos && periodosActivos.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-10 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="font-black text-amber-900 text-lg uppercase tracking-tight">Sin Periodos Activos</h3>
        <p className="text-amber-700 mt-2 text-sm max-w-sm mx-auto">
          No se pueden registrar observaciones hasta que un administrador active un periodo de monitoreo.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <form onSubmit={handleSubmit} className="space-y-10 pb-20">
        
        {/* 1. SECCIÓN: DATOS DE LA SESIÓN (Bento Style) */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
            <ClipboardCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Configuración de la Sesión</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Docente */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <User className="w-3 h-3 text-indigo-600" /> Docente a Observar
              </label>
              <Select
                options={docenteOptions}
                isLoading={loadingDocentes}
                onChange={handleDocenteSelect}
                isClearable
                placeholder="Buscar por DNI o Nombre..."
                className="text-sm"
                styles={customSelectStyles}
                value={formData.dni_docente ? docenteOptions.find(o => o.value === formData.dni_docente) : null}
              />
            </div>

            {/* Fecha */}
            <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Calendar className="w-3 h-3 text-indigo-600" /> Fecha de Registro
            </label>
            <DatePicker
              selected={formData.fecha ? new Date(formData.fecha + 'T12:00:00') : null}
              onChange={(date) => setFormData(prev => ({ ...prev, fecha: date ? date.toISOString().split('T')[0] : '' }))}
              locale={es}
              dateFormat="dd/MM/yyyy"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all"
              wrapperClassName="w-full"
            />
          </div>

            {/* Area, Grado, Seccion con React Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <BookOpen className="w-3 h-3 text-indigo-600" /> Área Curricular
              </label>
              <Select
                options={areaOptions}
                placeholder="Área..."
                styles={customSelectStyles}
                value={areaOptions.find(o => o.value === formData.area)}
                onChange={(opt) => setFormData(prev => ({ ...prev, area: opt?.value || '' }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <GraduationCap className="w-3 h-3 text-indigo-600" /> Grado
              </label>
              <Select
                options={gradoOptions}
                placeholder="Grado..."
                styles={customSelectStyles}
                value={gradoOptions.find(o => o.value === formData.grado)}
                onChange={(opt) => setFormData(prev => ({ ...prev, grado: opt?.value || '' }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Users className="w-3 h-3 text-indigo-600" /> Sección
              </label>
              <Select
                options={seccionOptions}
                placeholder="Sección..."
                styles={customSelectStyles}
                value={seccionOptions.find(o => o.value === formData.seccion)}
                onChange={(opt) => setFormData(prev => ({ ...prev, seccion: opt?.value || '' }))}
              />
            </div>
          </div>
        </div>

        {/* 2. SECCIÓN: RÚBRICAS DE DESEMPEÑO */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-4 w-1.5 bg-indigo-600 rounded-full" />
            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">Evaluación de Desempeño</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {INDICADORES.map((ind, idx) => (
              <div key={ind.id} className="bg-white border border-slate-200 rounded-lg p-8 transition-all hover:border-indigo-200 relative overflow-visible">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="max-w-2xl space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">0{idx + 1}</span>
                      <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{ind.nombre_corto || ind.nombre.split(' ')[0]}</h4>
                    </div>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">{ind.nombre}</p>
                  </div>

                  {/* Selector de Nivel High-Contrast */}
                  <div className="flex items-center bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                    {[1, 2, 3, 4].map(valor => {
                      const isSelected = formData[ind.id] === valor;
                      const nivel = NIVELES[valor];
                      return (
                        <button
                          key={valor}
                          type="button"
                          onClick={() => handleIndicatorChange(ind.id, valor)}
                          className={clsx(
                            'relative flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-lg transition-all duration-200 border-2',
                            isSelected
                              ? nivel.active
                              : 'bg-white border-slate-100 text-slate-300 hover:border-indigo-100 hover:text-indigo-400'
                          )}
                        >
                          <span className={clsx("text-2xl md:text-3xl font-black leading-none", isSelected ? "scale-110" : "scale-100")}>
                            {valor}
                          </span>
                          <span className={clsx(
                            "text-[9px] font-black uppercase tracking-tighter mt-2 px-1 text-center leading-tight",
                            isSelected ? "text-white" : "text-slate-400"
                          )}>
                            {nivel.etiqueta}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. SECCIÓN: OBSERVACIONES */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Notas y Observaciones</h3>
          </div>
          <div className="p-8">
            <textarea
              name="observaciones"
              rows={5}
              value={formData.observaciones}
              onChange={handleInputChange}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-300"
              placeholder="Describa aspectos relevantes de la observación, evidencias encontradas y compromisos del docente..."
            />
          </div>
        </div>

        {/* Footer de Acción */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex -space-x-2">
              {INDICADORES.map((ind, i) => (
                <div key={i} className={clsx("w-3 h-3 rounded-full border-2 border-white", formData[ind.id] > 0 ? "bg-indigo-500" : "bg-slate-200")} />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">
              {INDICADORES.filter(ind => formData[ind.id] > 0).length} de {INDICADORES.length} Indicadores completados
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-[320px] py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-lg shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Guardar Observación</>}
          </button>
        </div>

      </form>
    </div>
  );
};

export default FormularioMonitoreo;
