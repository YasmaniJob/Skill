import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Lock, Mail, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const FirstSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('check');
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data, error } = await supabase.rpc('db_is_empty');
      if (error) { setError('No se pudo verificar el estado de la DB'); setStep('error'); return; }
      setStep(data ? 'form' : 'redirect');
    };
    check();
  }, []);

  useEffect(() => {
    if (step === 'redirect') navigate('/login', { replace: true });
  }, [step, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    if (formData.password.length < 6) { setError('Minimo 6 caracteres'); return; }
    if (!formData.nombre || !formData.email) { setError('Nombre y email son obligatorios'); return; }

    setIsLoading(true);
    try {
      // 1. Crear el usuario en auth (el trigger handle_new_user crea el perfil automáticamente)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      // 2. Si signUp no inició sesión (email confirmation activo), hacer signIn explícito
      if (!authData.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw signInError;
      }

      // 3. Promover a super_admin (ON CONFLICT actualiza el perfil creado por el trigger)
      const { data: rpcData, error: rpcError } = await supabase.rpc('register_first_admin', {
        p_nombre: formData.nombre,
      });
      if (rpcError) throw rpcError;
      if (!rpcData?.success) throw new Error(rpcData?.error || 'Error al registrar el perfil');

      // 4. Cerrar sesión para que el usuario haga login normal
      await supabase.auth.signOut();

      setIsComplete(true);
      toast.success('Super Admin creado');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.message || 'Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'check') return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#4f46e5]" /></div>;
  if (step === 'error') return <div className="min-h-screen flex flex-col items-center justify-center"><AlertCircle className="w-10 h-10 text-red-400 mb-2"/><p className="text-sm text-slate-500">{error}</p></div>;
  if (isComplete) return <div className="min-h-screen flex flex-col items-center justify-center"><CheckCircle2 className="w-12 h-12 text-green-500 mb-4"/><h2 className="text-xl font-bold">Configuracion completa</h2><p className="text-sm text-slate-500 mt-1">Redirigiendo...</p></div>;

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[360px]">
        <div className="flex flex-col items-center mb-10">
          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm mb-5">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Primer Registro</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium text-center">Crea la cuenta Super Admin</p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Nombre</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="input-field pl-10" placeholder="Admin" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field pl-10" placeholder="admin@ejemplo.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="input-field pl-10" placeholder="••••••••" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Confirmar</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" required minLength={6} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="input-field pl-10" placeholder="••••••••" />
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-[11px] font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5 rounded-md text-sm font-bold flex items-center justify-center gap-2 mt-4">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Super Admin'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default FirstSetup;
