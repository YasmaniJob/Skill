import { useState } from 'react';
import { usePeriodos } from '../../hooks/usePeriodos';
import { useMonitoreos } from '../../hooks/useMonitoreos';
import { useDocentes } from '../../hooks/useDocentes';
import Select from 'react-select';
import { AREAS } from '../../data/areas';
import { GRADOS } from '../../data/grados';
import { SECCIONES } from '../../data/secciones';
import { INDICADORES, NIVELES } from '../../data/indicadores';
import {
  Save, User, IdCard, Calendar, BookOpen,
  GraduationCap, Users, Loader2, ClipboardList,
  CalendarRange, AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

const NIVEL_RING = {
  1: 'ring-red-200',
  2: 'ring-orange-200',
  3: 'ring-blue-200',
  4: 'ring-green-200',
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
      setFormData(prev => ({
        ...prev,
        dni_docente: '',
        nombre_docente: '',
      }));
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
      alert('Por favor califique todos los indicadores antes de guardar.');
      return;
    }
    setIsSubmitting(true);
    const success = await addMonitoreo(formData);
    if (success) {
      setFormData({ ...emptyForm, fecha: new Date().toISOString().split('T')[0] });
    }
    setIsSubmitting(false);
  };

  // Si no hay periodos activos, mostrar aviso
  if (!loadingPeriodos && periodosActivos.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-amber-800 text-lg">No hay periodos de monitoreo activos</h3>
          <p className="text-amber-700 mt-1">
            Un Director o Administrador debe crear y activar un periodo de monitoreo antes de registrar observaciones.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-sky-600" />
          Nuevo Registro de Monitoreo
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Ingrese la información detallada del desempeño docente observado.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Periodo */}
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
          <label className="text-sm font-bold text-sky-800 flex items-center gap-2 mb-2">
            <CalendarRange className="w-4 h-4" /> Periodo de Monitoreo
          </label>
          <select
            name="periodo_id"
            required
            value={formData.periodo_id}
            onChange={handleInputChange}
            className="input-field bg-white"
          >
            <option value="">Seleccione el periodo de monitoreo</option>
            {periodosActivos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        {/* Información General */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Fecha de visita
            </label>
            <input
              type="date"
              name="fecha"
              required
              value={formData.fecha}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Buscar Docente (DNI o Nombre)
            </label>
            <Select
              options={docenteOptions}
              isLoading={loadingDocentes}
              onChange={handleDocenteSelect}
              isClearable
              placeholder="Escriba para buscar..."
              noOptionsMessage={() => "No se encontró el docente"}
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: '#e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '2px',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#cbd5e1' }
                })
              }}
              value={formData.dni_docente ? docenteOptions.find(o => o.value === formData.dni_docente) : null}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" /> Área Curricular
            </label>
            <select
              name="area"
              required
              value={formData.area}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="">Seleccione Área</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400" /> Grado
            </label>
            <select
              name="grado"
              required
              value={formData.grado}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="">Seleccione Grado</option>
              {GRADOS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" /> Sección
            </label>
            <select
              name="seccion"
              required
              value={formData.seccion}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="">Seleccione Sección</option>
              {SECCIONES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Indicadores */}
        <div className="border-t border-slate-100 pt-8">
          <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-sky-600 rounded-full" />
            Indicadores de Desempeño Pedagógico
          </h3>
          <p className="text-xs text-slate-400 mb-6 ml-4">Basado en las Rúbricas de Observación de Aula — MINEDU</p>

          <div className="space-y-8">
            {INDICADORES.map((ind, idx) => (
              <div key={ind.id} className="space-y-3">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-sky-50 text-sky-700 border border-sky-200 rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-slate-700 font-medium pt-1 leading-snug">{ind.nombre}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-12">
                  {[1, 2, 3, 4].map(valor => {
                    const isSelected = formData[ind.id] === valor;
                    return (
                      <button
                        key={valor}
                        type="button"
                        onClick={() => handleIndicatorChange(ind.id, valor)}
                        className={clsx(
                          'flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                          isSelected
                            ? `${NIVELES[valor].border} ${NIVELES[valor].color} text-white ring-4 ring-offset-2 ${NIVEL_RING[valor]}`
                            : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                        )}
                      >
                        <span className="text-2xl font-bold">{valor}</span>
                        <span className={clsx(
                          'text-[10px] uppercase font-black tracking-wider mt-1 text-center',
                          isSelected ? 'text-white/90' : 'text-slate-400'
                        )}>
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
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Observaciones <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <textarea
            name="observaciones"
            rows={3}
            placeholder="Comentarios adicionales sobre la sesión de aprendizaje observada..."
            value={formData.observaciones}
            onChange={handleInputChange}
            className="input-field resize-none"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary min-w-[220px] flex items-center justify-center gap-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</>
            ) : (
              <><Save className="w-5 h-5" /> Guardar Registro</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioMonitoreo;
