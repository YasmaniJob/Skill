import { useState, useEffect } from 'react';
import { useAdminUsuarios } from '../../hooks/useAdminUsuarios';
import { supabase } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';
import { ShieldCheck, Upload, Save, Loader2, AlertTriangle, Users, Plus, ArrowLeft, Download, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import EditarPerfilDrawer from './EditarPerfilDrawer';

const CargaPerfiles = () => {
  const { upsertUsuario, bulkUpsertUsuarios, loading: isSaving } = useAdminUsuarios();
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [view, setView] = useState('list');
  const [previewData, setPreviewData] = useState([]);
  const [editingPerfil, setEditingPerfil] = useState(null); // perfil object to edit
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({ email: '', dni: '', nombre: '', rol: 'coordinador' });

  const fetchPerfiles = async () => {
    setLoading(true);
    // Intentamos traer el DNI también (asumiendo que se agregará la columna)
    const { data } = await supabase.from('perfiles').select('*').order('created_at', { ascending: false });
    setPerfiles(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPerfiles(); }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const paddedDni = formData.dni.trim().padStart(8, '0');
    // Se pasa el DNI como password inicial y como campo dni
    const ok = await upsertUsuario({ ...formData, dni: paddedDni, password: paddedDni });
    if (ok) {
      setFormData({ email: '', dni: '', nombre: '', rol: 'coordinador' });
      fetchPerfiles();
      setView('list');
    }
  };

  const startEdit = (p) => setEditingPerfil(p);

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar acceso de "${nombre || 'este usuario'}"? Esta acción no eliminará su cuenta de autenticación.`)) return;
    setDeletingId(id);
    const { error } = await supabase.from('perfiles').delete().eq('id', id);
    setDeletingId(null);
    if (error) {
      toast.error('Error al eliminar: ' + error.message);
    } else {
      toast.success('Acceso eliminado del sistema');
      fetchPerfiles();
    }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ EMAIL: 'ejemplo@colegio.edu.pe', DNI: '12345678', NOMBRE: 'Juan Perez', ROL: 'coordinador' }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accesos");
    XLSX.writeFile(wb, "Plantilla_Accesos.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        const parsedUsuarios = data.map(row => {
          const rawDni = String(row.DNI || row.dni || row.Dni || '').trim().padStart(8, '0');
          return {
            email: String(row.EMAIL || row.email || '').trim(),
            password: rawDni,
            dni: rawDni,
            nombre: String(row.NOMBRE || row.nombre || row.Nombre || '').trim(),
            rol: String(row.ROL || row.rol || row.Rol || '').toLowerCase().trim(),
          };
        }).filter(u => u.email && u.password && u.rol && u.password !== '00000000');

        if (parsedUsuarios.length === 0) {
          toast.error('No se encontraron datos válidos. Usa columnas EMAIL, DNI, NOMBRE, ROL.');
          setIsUploading(false);
          return;
        }

        const validRoles = ['admin', 'director', 'subdirector', 'coordinador'];
        const invalidRoles = parsedUsuarios.filter(u => !validRoles.includes(u.rol));
        if (invalidRoles.length > 0) {
          toast.error(`Roles inválidos encontrados: ${invalidRoles.map(u => u.rol).join(', ')}. Usa admin, director, subdirector o coordinador.`);
          setIsUploading(false);
          return;
        }
        
        setPreviewData(parsedUsuarios);
        setView('preview');
      } catch (error) {
        console.error(error);
        toast.error('Error al procesar el archivo Excel');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // reset input
  };

  const handleConfirmUpload = async () => {
    const ok = await bulkUpsertUsuarios(previewData);
    if (ok) {
      setPreviewData([]);
      fetchPerfiles();
      setView('list');
    }
  };

  return (
    <>
    <div className="space-y-6">
      {/* Aviso de Seguridad */}
      {!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-amber-800">Advertencia de Seguridad (Service Role Key)</h4>
            <p className="text-sm text-amber-700 mt-1">
              Para crear usuarios desde este panel, asegúrate de haber configurado <code>VITE_SUPABASE_SERVICE_ROLE_KEY</code> en tu archivo <code>.env</code>. 
              Esta función crea credenciales reales de acceso al sistema.
            </p>
          </div>
        </div>
      )}

      {/* Barra de Acciones */}
      {view === 'list' && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Perfiles y Accesos</h3>
              <p className="text-xs text-slate-500">{perfiles.length} usuarios con acceso al sistema</p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={() => setView('manual')} className="btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Acceso
            </button>
            <button onClick={() => setView('excel')} className="btn-primary bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-none flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" /> Carga Masiva
            </button>
          </div>
        </div>
      )}

      {/* Vista: Formulario Manual */}
      {view === 'manual' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" /> Crear Acceso Individual
            </h3>
            <button onClick={() => setView('list')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
          </div>
          <form onSubmit={handleManualSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700">Correo Electrónico</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">DNI (Contraseña inicial)</label>
              <input type="text" required maxLength={8} minLength={8} value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} className="input-field mt-1" placeholder="Ej: 12345678" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Nombre del Funcionario</label>
              <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Rol del Sistema</label>
              <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})} className="input-field mt-1">
                <option value="director">Director</option>
                <option value="subdirector">Subdirector</option>
                <option value="coordinador">Coordinador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={isSaving} className="btn-primary bg-purple-600 hover:bg-purple-700 w-full py-2.5 flex justify-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Otorgar Acceso
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vista: Previsualización */}
      {view === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Previsualización de Carga</h3>
                <p className="text-sm text-slate-500">Revisa los datos antes de crear los accesos.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setView('excel')} className="btn-secondary py-2">
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmUpload} 
                  disabled={isSaving}
                  className="btn-primary bg-purple-600 hover:bg-purple-700 py-2 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Confirmar y Cargar {previewData.length} usuarios
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">DNI (Contraseña)</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Nombre</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Email</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {previewData.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-purple-600 font-bold">{u.dni}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{u.nombre}</td>
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {u.rol}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vista: Carga Masiva */}
      {view === 'excel' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
          <div className="flex justify-end mb-2">
            <button onClick={() => setView('list')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
          </div>
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Carga Masiva de Accesos</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Sube un archivo `.xlsx` con las columnas exactas: <br/><br/>
            <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">EMAIL</span> 
            <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700 mx-2">DNI</span> 
            <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">NOMBRE</span> 
            <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700 ml-2">ROL</span>
          </p>
          
          <button onClick={handleDownloadTemplate} className="text-purple-600 hover:text-purple-700 text-sm font-bold flex items-center justify-center gap-1.5 mx-auto mb-8 bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
            <Download className="w-4 h-4" /> Descargar Plantilla de Ejemplo
          </button>
          
          <label className="cursor-pointer relative overflow-hidden block max-w-sm mx-auto">
            <div className={clsx(
              "btn-primary bg-purple-600 hover:bg-purple-700 w-full py-3.5 flex items-center justify-center gap-2 text-base",
              (isUploading || isSaving) && "opacity-75 cursor-not-allowed"
            )}>
              {(isUploading || isSaving) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {(isUploading || isSaving) ? 'Procesando accesos...' : 'Seleccionar Excel'}
            </div>
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} disabled={isUploading || isSaving} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </label>
        </div>
      )}

      {/* Lista Actual */}
      {view === 'list' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Cargando perfiles...</div>
            ) : perfiles.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <Users className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-slate-500 font-medium">Aún no hay usuarios adicionales.</p>
                <p className="text-sm text-slate-400 mt-1">Usa los botones superiores para empezar a agregar.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {perfiles.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{p.nombre || '—'}</td>
                      <td className="px-6 py-3.5">
                        <span className={clsx(
                          "text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide",
                          p.rol === 'admin' ? "bg-purple-100 text-purple-700" :
                          p.rol === 'director' ? "bg-sky-100 text-sky-700" :
                          p.rol === 'subdirector' ? "bg-blue-100 text-blue-700" :
                          "bg-teal-100 text-teal-700"
                        )}>
                          {p.rol}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(p)} className="text-slate-400 hover:text-purple-600 p-1.5 rounded-lg hover:bg-purple-50 transition-colors" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id, p.nombre)} disabled={deletingId === p.id} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
                            {deletingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>

      {/* Drawer de Edición */}
      {editingPerfil && (
        <EditarPerfilDrawer
          perfil={editingPerfil}
          onClose={() => setEditingPerfil(null)}
          onSaved={() => { setEditingPerfil(null); fetchPerfiles(); }}
        />
      )}
    </>
  );
};

export default CargaPerfiles;
