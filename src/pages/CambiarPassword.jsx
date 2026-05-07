import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth.jsx';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CambiarPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshPerfil } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error('Las contraseñas no coinciden');
    }
    if (password.length < 6) {
      return toast.error('La contraseña debe tener al menos 6 caracteres');
    }

    setLoading(true);

    try {
      // 1. Actualizar contraseña en Auth
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        password: password
      });

      if (authError) throw authError;

      // 2. Marcar bandera via RPC (bypasa RLS para cualquier rol)
      const { data: rpcData, error: profileError } = await supabase
        .rpc('skip_password_change');

      if (profileError) throw profileError;
      if (!rpcData?.success) throw new Error(rpcData?.error || 'Error al actualizar perfil');

      // 3. Cerrar sesión para forzar login con nueva contraseña
      await supabase.auth.signOut();

      toast.success('¡Contraseña actualizada! Inicia sesión con tu nueva contraseña.');
      navigate('/login', { replace: true });

    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      // RPC con SECURITY DEFINER: bypasa RLS para actualizar debe_cambiar_pass
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('skip_password_change');

      if (rpcError) throw rpcError;
      if (!rpcData?.success) throw new Error(rpcData?.error || 'Error al actualizar perfil');

      // Refrescar perfil en contexto ANTES de navegar para evitar loop
      await refreshPerfil();

      navigate('/', { replace: true });

    } catch (error) {
      console.error(error);
      toast.error('Error al omitir: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 p-10">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-[#4f46e5]/10 rounded-lg">
            <ShieldCheck className="w-10 h-10 text-[#4f46e5]" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Cambio de Contraseña</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-4">
            Seguridad de la Cuenta
          </p>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed px-4">
            Te recomendamos establecer una contraseña personal. Puedes omitir este paso y seguir usando tu DNI si lo prefieres.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#4f46e5] transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#4f46e5] transition-all"
                placeholder="Repite la contraseña"
              />
            </div>
          </div>

          <div className="pt-6 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#4f46e5] text-white font-black text-[11px] uppercase tracking-widest rounded-lg transition-all hover:bg-[#4338ca] disabled:opacity-50 flex items-center justify-center"
            >
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : 'Guardar y Continuar'
              }
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="w-full py-4 bg-white text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-lg border border-slate-200 transition-all hover:bg-slate-50 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Omitir por ahora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CambiarPassword;
