import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CambiarPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      // 2. Actualizar bandera en perfiles
      const { error: profileError } = await supabase
        .from('perfiles')
        .update({ debe_cambiar_pass: false })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      await supabase.auth.signOut();
      toast.success('¡Contraseña actualizada! Por favor, inicia sesión nuevamente.');
      navigate('/login');

    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar la contraseña. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error: profileError } = await supabase
        .from('perfiles')
        .update({ debe_cambiar_pass: false })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // No cerramos sesión, los dejamos pasar directo al dashboard
      window.location.href = '/'; 

    } catch (error) {
      console.error(error);
      toast.error('Error al omitir el paso.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl overflow-hidden border border-slate-100 p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-sky-600" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cambio de Contraseña</h2>
          <p className="text-sm text-slate-500 mt-2">
            Por seguridad, te recomendamos establecer una nueva contraseña personal. Si lo prefieres, puedes omitir este paso y seguir usando tu DNI.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" /> Nueva Contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" /> Confirmar Contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
              placeholder="Repite tu nueva contraseña"
            />
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar y Continuar'}
            </button>
            
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-bold rounded-xl border border-slate-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Omitir por ahora (Mantener DNI)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CambiarPassword;
