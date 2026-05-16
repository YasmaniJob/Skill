import { useState } from 'react';
import { useInstituciones } from '../hooks/useInstituciones';
import { useAuth } from '../hooks/useAuth.jsx';
import { useIE } from '../hooks/useIE.jsx';
import {
  Building2, Plus, Loader2, AlertCircle,
  ToggleLeft, ToggleRight, User, IdCard, Mail, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const GestionIE = () => {
  const { esSuperAdmin } = useAuth();
  const { refreshIes } = useIE();
  const { instituciones, loading, createInstitucion, toggleEstado } = useInstituciones();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', codigo_minedu: '', direccion: '', ugel: '',
    admin_email: '', admin_nombre: '', admin_dni: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!esSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Acceso denegado</h2>
        <p className="text-sm text-slate-500 mt-2">Solo el super administrador puede gestionar instituciones.</p>
      </div>
    );
  }

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.admin_email || !formData.admin_nombre || !formData.admin_dni) {
      toast.error('Todos los campos marcados con * son obligatorios');
      return;
    }
    if (formData.admin_dni.replace(/\D/g, '').length < 7) {
      toast.error('El DNI debe tener al menos 7 dígitos');
      return;
    }
    setIsSubmitting(true);
    const ok = await createInstitucion(formData);
    setIsSubmitting(false);
    if (ok) {
      setShowForm(false);
      setFormData({ nombre: '', codigo_minedu: '', direccion: '', ugel: '', admin_email: '', admin_nombre: '', admin_dni: '' });
      refreshIes();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Instituciones Educativas</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Gestión de IEs y administradores
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm font-bold">
          <Plus className="w-4 h-4" /> Nueva IE
        </button>
      </div>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm"
          >
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-5">Nueva Institución</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Datos de la IE */}
              <div>
                <p className="text-[10px] font-black text-[#4f46e5] uppercase tracking-widest mb-3">Institución</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre *</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                      className="input-field mt-1" placeholder="I.E. San Martín de Porres" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código MINEDU</label>
                    <input type="text" name="codigo_minedu" value={formData.codigo_minedu} onChange={handleChange}
                      className="input-field mt-1" placeholder="12345678" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UGEL</label>
                    <input type="text" name="ugel" value={formData.ugel} onChange={handleChange}
                      className="input-field mt-1" placeholder="UGEL 01 - Lima" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dirección</label>
                    <input type="text" name="direccion" value={formData.direccion} onChange={handleChange}
                      className="input-field mt-1" placeholder="Av. Principal 123" />
                  </div>
                </div>
              </div>

              {/* Datos del Admin */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-black text-[#4f46e5] uppercase tracking-widest mb-3">
                  Administrador <span className="text-slate-300 font-medium normal-case">· contraseña inicial = DNI</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre *</label>
                    <input type="text" name="admin_nombre" value={formData.admin_nombre} onChange={handleChange} required
                      className="input-field mt-1" placeholder="Juan Pérez" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email *</label>
                    <input type="email" name="admin_email" value={formData.admin_email} onChange={handleChange} required
                      className="input-field mt-1" placeholder="admin@ie.edu.pe" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DNI *</label>
                    <input type="text" name="admin_dni" value={formData.admin_dni} onChange={handleChange} required
                      maxLength={8} className="input-field mt-1 font-mono tracking-widest" placeholder="12345678" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2 text-sm font-bold">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isSubmitting ? 'Creando...' : 'Crear IE y Admin'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50">
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institución</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">UGEL</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrador</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Docentes</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monitoreos</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {instituciones.map((ie) => (
                <tr key={ie.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* IE */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{ie.nombre}</p>
                        {ie.codigo_minedu && (
                          <p className="text-[10px] text-slate-400 font-mono">{ie.codigo_minedu}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* UGEL */}
                  <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">
                    {ie.ugel || <span className="text-slate-300">—</span>}
                  </td>

                  {/* Admin */}
                  <td className="px-4 py-3">
                    {ie.admin ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-sm font-semibold text-slate-800">{ie.admin.nombre}</span>
                        </div>
                        {ie.admin.dni && (
                          <div className="flex items-center gap-1.5">
                            <IdCard className="w-3 h-3 text-slate-300 shrink-0" />
                            <span className="text-[11px] font-mono text-slate-400">{ie.admin.dni}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-300 italic">Sin admin asignado</span>
                    )}
                  </td>

                  {/* Docentes */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-bold text-slate-700">
                      {ie.total_docentes?.[0]?.count ?? 0}
                    </span>
                  </td>

                  {/* Monitoreos */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-bold text-slate-700">
                      {ie.total_monitoreos?.[0]?.count ?? 0}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleEstado(ie.id, ie.estado)}
                      className={clsx(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all',
                        ie.estado === 'activo'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      )}
                    >
                      {ie.estado === 'activo'
                        ? <ToggleRight className="w-3.5 h-3.5" />
                        : <ToggleLeft className="w-3.5 h-3.5" />
                      }
                      {ie.estado}
                    </button>
                  </td>
                </tr>
              ))}
              {instituciones.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Building2 className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No hay instituciones registradas</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GestionIE;
