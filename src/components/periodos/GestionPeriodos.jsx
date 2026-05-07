import { useState } from 'react';
import { usePeriodos } from '../../hooks/usePeriodos';
import { useAuth } from '../../hooks/useAuth.jsx';
import {
  Plus, CalendarRange, Lock, Unlock, Trash2,
  CheckCircle2, XCircle, Loader2, ClipboardList,
} from 'lucide-react';
import { clsx } from 'clsx';

const VISITAS = [1, 2, 3, 4, 5];

const GestionPeriodos = () => {
  const { periodos, loading, createPeriodo, toggleEstado, deletePeriodo } = usePeriodos();
  const { esAdmin, esDirectivo } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const anioActual = new Date().getFullYear();
  const [formData, setFormData] = useState({
    anio: anioActual,
    numero_visita: 1,
    fecha_inicio: '',
    fecha_fin: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await createPeriodo({
      ...formData,
      anio: parseInt(formData.anio),
      numero_visita: parseInt(formData.numero_visita),
      estado: 'activo',
    });
    if (success) {
      setShowForm(false);
      setFormData({ anio: anioActual, numero_visita: 1, fecha_inicio: '', fecha_fin: '' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el periodo "${nombre}"?\nEsta acción eliminará TODOS los registros asociados.`)) return;
    await deletePeriodo(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-sky-600" />
            Periodos de Monitoreo
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Cada periodo agrupa los monitoreos de una visita de aula
          </p>
        </div>
        {esDirectivo && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="btn-primary flex items-center gap-2 py-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Periodo
          </button>
        )}
      </div>

      {/* Formulario de creación */}
      {showForm && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6">
          <h3 className="font-bold text-sky-800 mb-4">Crear nuevo periodo</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Año</label>
              <input
                type="number"
                name="anio"
                required
                min={2024}
                max={2035}
                value={formData.anio}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">N° de Visita</label>
              <select
                name="numero_visita"
                required
                value={formData.numero_visita}
                onChange={handleChange}
                className="input-field"
              >
                {VISITAS.map(v => (
                  <option key={v} value={v}>Visita {v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Fecha inicio</label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Fecha fin</label>
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary py-2 flex items-center gap-2 text-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Crear Periodo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de periodos */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Cargando periodos...</div>
        ) : periodos.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarRange className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No hay periodos registrados</p>
            <p className="text-slate-400 text-sm mt-1">Crea el primer periodo de monitoreo para comenzar</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Periodo</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Año</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Visita</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Fechas</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Registros</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {periodos.map(p => {
                const totalReg = p.total_monitoreos?.[0]?.count ?? 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{p.nombre}</td>
                    <td className="px-6 py-4 text-slate-600">{p.anio}</td>
                    <td className="px-6 py-4">
                      <span className="bg-sky-100 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        Visita {p.numero_visita}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {p.fecha_inicio && p.fecha_fin
                        ? `${new Date(p.fecha_inicio).toLocaleDateString()} – ${new Date(p.fecha_fin).toLocaleDateString()}`
                        : <span className="text-slate-300 italic">Sin fechas</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                        <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                        {totalReg}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold',
                        p.estado === 'activo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      )}>
                        {p.estado === 'activo'
                          ? <><CheckCircle2 className="w-3 h-3" /> Activo</>
                          : <><XCircle className="w-3 h-3" /> Cerrado</>
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {esDirectivo && (
                          <button
                            onClick={() => toggleEstado(p.id, p.estado)}
                            title={p.estado === 'activo' ? 'Cerrar periodo' : 'Reabrir periodo'}
                            className={clsx(
                              'p-2 rounded-lg transition-all text-sm',
                              p.estado === 'activo'
                                ? 'text-orange-500 hover:bg-orange-50'
                                : 'text-green-600 hover:bg-green-50'
                            )}
                          >
                            {p.estado === 'activo' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        )}
                        {esAdmin && (
                          <button
                            onClick={() => handleDelete(p.id, p.nombre)}
                            title="Eliminar periodo"
                            className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GestionPeriodos;
