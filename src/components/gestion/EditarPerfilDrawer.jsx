import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdminUsuarios } from '../../hooks/useAdminUsuarios';
import { X, Save, Loader2, RefreshCw, IdCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';

const ROLES = [
  { value: 'director',    label: 'Director',    color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  { value: 'subdirector', label: 'Subdirector', color: 'bg-slate-50 text-slate-700 border-slate-100' },
  { value: 'coordinador', label: 'Coordinador', color: 'bg-slate-50 text-slate-700 border-slate-100' },
  { value: 'admin',       label: 'Admin',       color: 'bg-[#4f46e5] text-white border-[#4f46e5]' },
];

const EditarPerfilDrawer = ({ perfil, onClose, onSaved }) => {
  const { resetPasswordToDNI } = useAdminUsuarios();
  const [nombre, setNombre]           = useState(perfil.nombre || '');
  const [rol, setRol]                 = useState(perfil.rol);
  const [dni, setDni]                 = useState(perfil.dni || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [resetting, setResetting]     = useState(false);

  const handleSaveProfile = async () => {
    if (!nombre.trim()) return toast.error('El nombre no puede estar vacío');
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nombre: nombre.trim(),
          rol,
          dni: dni.trim().padStart(8, '0')
        })
        .eq('id', perfil.id);

      if (error) throw error;
      toast.success('Perfil actualizado');
      onSaved();
    } catch (error) {
      toast.error('Error al actualizar perfil: ' + error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResetToDNI = async () => {
    if (!dni && !perfil.dni) {
      return toast.error('No hay un DNI registrado.');
    }
    setResetting(true);
    const ok = await resetPasswordToDNI(perfil.id, dni || perfil.dni);
    setResetting(false);
    if (ok) onSaved();
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-none border-l border-slate-200">
        
        {/* Header Flat */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#4f46e5]/10 flex items-center justify-center text-[#4f46e5] font-black text-lg">
              {(perfil.nombre || '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-lg leading-tight tracking-tight">{perfil.nombre || 'Personal'}</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{perfil.rol}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-1 bg-[#4f46e5] rounded-full" />
              <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em]">Datos del Perfil</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="input-field"
                  placeholder="Apellidos y Nombres"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DNI / Contraseña Inicial</label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength={8}
                    value={dni}
                    onChange={e => setDni(e.target.value)}
                    className="input-field pl-12 font-mono"
                    placeholder="00000000"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol Asignado</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRol(r.value)}
                      className={clsx(
                        'px-4 py-3 rounded-lg border text-[11px] font-black uppercase tracking-widest transition-all',
                        rol === r.value
                          ? 'border-[#4f46e5] bg-[#4f46e5] text-white'
                          : 'border-slate-200 text-slate-400 bg-white hover:border-slate-300'
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-3 w-1 bg-amber-500 rounded-full" />
              <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em]">Seguridad y Acceso</h3>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-6 space-y-4 text-center">
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                ¿El usuario olvidó su contraseña? <br/>
                <span className="text-[10px] text-amber-600 mt-1 block">
                  Se restablecerá su acceso usando el DNI como clave temporal.
                </span>
              </p>
              <button
                onClick={handleResetToDNI}
                disabled={resetting}
                className="w-full py-3 bg-white border border-amber-200 text-amber-600 font-black text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-amber-50 transition-all"
              >
                {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Resetear al DNI
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 flex gap-3 bg-slate-50/50">
          <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-50 transition-all">
            Cerrar
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="flex-1 py-3 bg-[#4f46e5] text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-[#4338ca] transition-all flex items-center justify-center gap-2 shadow-none"
          >
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar
          </button>
        </div>
      </div>
    </>
  );
};

export default EditarPerfilDrawer;
