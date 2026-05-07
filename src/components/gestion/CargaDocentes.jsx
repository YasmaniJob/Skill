import { useState } from 'react';
import { useDocentes } from '../../hooks/useDocentes';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Upload, Users, Loader2, Save, Trash2, Plus, ArrowLeft, Download, Pencil, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AREAS } from '../../data/areas';
import { clsx } from 'clsx';

const CargaDocentes = () => {
  const { docentes, loading, upsertDocente, bulkUpsertDocentes, deleteDocente } = useDocentes();
  const [isUploading, setIsUploading] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'manual' | 'excel' | 'preview'
  const [previewData, setPreviewData] = useState([]);
  const [editingDni, setEditingDni] = useState(null);
  const [editData, setEditData] = useState({});

  // Formulario manual
  const [formData, setFormData] = useState({ dni: '', nombre_completo: '', area_principal: '' });

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const paddedDni = formData.dni.trim().padStart(8, '0');
    const ok = await upsertDocente({ ...formData, dni: paddedDni });
    if (ok) {
      setFormData({ dni: '', nombre_completo: '', area_principal: '' });
      setView('list');
    }
  };

  const startEdit = (d) => {
    setEditingDni(d.dni);
    setEditData({ nombre_completo: d.nombre_completo, area_principal: d.area_principal || '' });
  };

  const cancelEdit = () => setEditingDni(null);

  const saveEdit = async (dni) => {
    const ok = await upsertDocente({ dni, ...editData });
    if (ok) setEditingDni(null);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ DNI: '12345678', NOMBRE: 'Juan Perez', AREA: 'Matemática' }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Docentes");
    XLSX.writeFile(wb, "Plantilla_Docentes.xlsx");
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
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const parsedDocentes = data.map(row => ({
          dni: String(row.DNI || row.dni || '').trim().padStart(8, '0'),
          nombre_completo: String(row.NOMBRE || row.nombre || row.Nombre || '').trim(),
          area_principal: String(row.AREA || row.area || row.Area || '').trim(),
        })).filter(d => d.dni && d.dni !== '00000000' && d.nombre_completo);

        if (parsedDocentes.length === 0) {
          toast.error('No se encontraron datos válidos. Asegúrate de tener las columnas DNI y NOMBRE.');
          setIsUploading(false);
          return;
        }

        setPreviewData(parsedDocentes);
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
    const ok = await bulkUpsertDocentes(previewData);
    if (ok) {
      setPreviewData([]);
      setView('list');
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Acciones */}
      {view === 'list' && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Padrón de Docentes</h3>
              <p className="text-xs text-slate-500">{docentes.length} docentes registrados en el sistema</p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={() => setView('manual')} className="btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Individual
            </button>
            <button onClick={() => setView('excel')} className="btn-primary bg-green-600 hover:bg-green-700 flex-1 sm:flex-none flex items-center justify-center gap-2">
              <FileSpreadsheet className="w-4 h-4" /> Carga Masiva
            </button>
          </div>
        </div>
      )}

      {/* Vista: Formulario Manual */}
      {view === 'manual' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-600" /> Registrar Docente Manual
            </h3>
            <button onClick={() => setView('list')} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
          </div>
          <form onSubmit={handleManualSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700">DNI</label>
              <input type="text" required maxLength={8} value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} className="input-field mt-1" placeholder="Ej: 12345678" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Nombre Completo</label>
              <input type="text" required value={formData.nombre_completo} onChange={e => setFormData({...formData, nombre_completo: e.target.value})} className="input-field mt-1" placeholder="Apellidos y Nombres" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Área Principal (Opcional)</label>
              <select value={formData.area_principal} onChange={e => setFormData({...formData, area_principal: e.target.value})} className="input-field mt-1">
                <option value="">Ninguna</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="pt-2">
              <button type="submit" className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Guardar Docente
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
                <p className="text-sm text-slate-500">Revisa los datos de los docentes antes de guardarlos.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setView('excel')} className="btn-secondary py-2">
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmUpload} 
                  className="btn-primary bg-green-600 hover:bg-green-700 py-2 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Confirmar y Cargar {previewData.length} docentes
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">DNI</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Nombre Completo</th>
                    <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Área</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {previewData.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-sky-600 font-bold">{d.dni}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{d.nombre_completo}</td>
                      <td className="px-4 py-3">
                        {d.area_principal ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {d.area_principal}
                          </span>
                        ) : '—'}
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
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Carga Masiva de Docentes</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Sube un archivo `.xlsx` o `.csv` con las siguientes columnas exactas: <br/><br/>
            <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">DNI</span> 
            <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700 mx-2">NOMBRE</span>
            <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">AREA</span>
          </p>
          
          <button onClick={handleDownloadTemplate} className="text-sky-600 hover:text-sky-700 text-sm font-bold flex items-center justify-center gap-1.5 mx-auto mb-8 bg-sky-50 px-4 py-2 rounded-lg hover:bg-sky-100 transition-colors">
            <Download className="w-4 h-4" /> Descargar Plantilla de Ejemplo
          </button>
          
          <label className="cursor-pointer relative overflow-hidden block max-w-sm mx-auto">
            <div className={clsx(
              "btn-primary bg-green-600 hover:bg-green-700 w-full py-3.5 flex items-center justify-center gap-2 text-base",
              isUploading && "opacity-75 cursor-not-allowed"
            )}>
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {isUploading ? 'Procesando archivo...' : 'Seleccionar Excel'}
            </div>
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </label>
        </div>
      )}

      {/* Lista Actual */}
      {view === 'list' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Cargando docentes...</div>
            ) : docentes.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <Users className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-slate-500 font-medium">Aún no hay docentes registrados.</p>
                <p className="text-sm text-slate-400 mt-1">Usa los botones superiores para empezar a agregar.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">DNI</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Área Principal</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docentes.map(d => (
                    <tr key={d.dni} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-slate-600 text-xs">{d.dni}</td>
                      {editingDni === d.dni ? (
                        <>
                          <td className="px-3 py-2">
                            <input autoFocus value={editData.nombre_completo} onChange={e => setEditData({...editData, nombre_completo: e.target.value})} className="input-field text-sm py-1.5" />
                          </td>
                          <td className="px-3 py-2">
                            <select value={editData.area_principal} onChange={e => setEditData({...editData, area_principal: e.target.value})} className="input-field text-sm py-1.5">
                              <option value="">Ninguna</option>
                              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => saveEdit(d.dni)} className="text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                                <Save className="w-3 h-3" /> Guardar
                              </button>
                              <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-3.5 font-semibold text-slate-800">{d.nombre_completo}</td>
                          <td className="px-6 py-3.5 text-slate-500">
                            {d.area_principal ? (
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">{d.area_principal}</span>
                            ) : '—'}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => startEdit(d)} className="text-slate-400 hover:text-sky-600 p-1.5 rounded-lg hover:bg-sky-50 transition-colors" title="Editar">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => { if (window.confirm('¿Eliminar este docente?')) deleteDocente(d.dni); }} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CargaDocentes;
