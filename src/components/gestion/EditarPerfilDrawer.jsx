import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAdminUsuarios } from '../../hooks/useAdminUsuarios';
import { X, Save, Loader2, User, RefreshCw, AlertTriangle, IdCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';

const ROLES = [
  { value: 'director',    label: 'Director',    color: 'bg-sky-100 text-sky-700' },
  { value: 'subdirector', label: 'Subdirector', color: 'bg-blue-100 text-blue-700' },
  { value: 'coordinador', label: 'Coordinador', color: 'bg-teal-100 text-teal-700' },
  { value: 'admin',       label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
];

const EditarPerfilDrawer = ({ perfil, onClose, onSaved }) => {
  const { resetPasswordToDNI } = useAdminUsuarios();
  const [nombre, setNombre]           = useState(perfil.nombre || '');
  const [rol, setRol]                 = useState(perfil.rol);
  const [dni, setDni]                 = useState(perfil.dni || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [resetting, setResetting]     = useState(false);

  /* ── Guardar nombre y rol ── */
  const handleSaveProfile = async () => {
    if (!nombre.trim()) return toast.error('El nombre no puede estar vacío');
    setSavingProfile(true);
    const { error } = await supabase
      .from('perfiles')
      .update({ nombre: nombre.trim(), rol, dni: dni.trim().padStart(8, '0') })
      .eq('id', perfil.id);
    setSavingProfile(false);
    if (error) { toast.error('Error: ' + error.message); return; }
    toast.success('Perfil actualizado');
    onSaved();
  };

  const handleResetToDNI = async () => {
    if (!dni && !perfil.dni) {
      return toast.error('No hay un DNI registrado para este usuario. Por favor, ingresa uno primero.');
    }

    setResetting(true);
    const ok = await resetPasswordToDNI(perfil.id, dni || perfil.dni);
    setResetting(false);

    if (ok) onSaved();
  };

  const rolActual = ROLES.find(r => r.value === rol);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow">
              {(perfil.nombre || '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-base leading-tight">{perfil.nombre || 'Sin nombre'}</h2>
              <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide', rolActual?.color)}>
                {rolActual?.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* ── Datos del perfil ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Datos del Perfil</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1.5 block">Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1.5 block">DNI / Contraseña Inicial</label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength={8}
                    value={dni}
                    onChange={e => setDni(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono text-sm"
                    placeholder="Ej: 01234567"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 ml-1">Este DNI se usará para el reseteo de contraseña.</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Rol en el Sistema</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRol(r.value)}
                      className={clsx(
                        'px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all',
                        rol === r.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar Cambios
              </button>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* ── Resetear contraseña ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Contraseña</h3>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 space-y-4">
              <div>
                <p className="font-bold text-orange-800 text-sm">¿El usuario olvidó su contraseña?</p>
                <p className="text-sm text-orange-700 mt-1.5 leading-relaxed">
                  Al resetear, en el próximo ingreso usará su <strong>DNI como contraseña</strong> y el sistema le pedirá crear una nueva.
                </p>
                <p className="text-xs text-orange-600 mt-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  Recuerda avisarle al usuario que ingrese con su DNI.
                </p>
              </div>
              <button
                onClick={handleResetToDNI}
                disabled={resetting}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Resetear Contraseña al DNI
              </button>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="w-full py-2.5 border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
};

export default EditarPerfilDrawer;
