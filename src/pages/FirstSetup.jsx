import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const FirstSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('check'); // 'check' | 'form' | 'error'
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  // Verificar si ya hay un super_admin — si hay, ir al login
  useEffect(() => {
    const check = async () => {
      try {
        const { data: isSetupDone, error: checkErr } = await supabase.rpc('is_setup_complete');
        if (checkErr) throw checkErr;
        if (isSetupDone) {
          navigate('/login', { replace: true });
        } else {
          setStep('form');
        }
      } catch (err) {
        console.error('Error checking setup:', err);
        setError('No se pudo conectar con la base de datos. Verifica las variables de entorno.');
        setStep('error');
      }
    };
    check();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    if (formData.password.length < 8) { setError('Mínimo 8 caracteres'); return; }
    if (!formData.nombre || !formData.email) { setError('Nombre y email son obligatorios'); return; }

    setIsLoading(true);
    try {
      // 1. Registrar en Supabase Auth (requiere email confirmation desactivado)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { nombre: formData.nombre } }
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('No se recibió respuesta del servidor de autenticación.');

      // 2. Con sesión activa (email confirmation OFF), actualizar el perfil a super_admin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nombre: formData.nombre,
          rol: 'super_admin',
          debe_cambiar_pass: false,
        })
        .eq('id', signUpData.user.id);

      if (profileError) throw profileError;

      // 3. Cerrar sesión — el usuario deberá iniciar sesión formalmente
      await supabase.auth.signOut();

      setIsComplete(true);
      toast.success('¡Super Admin creado! Inicia sesión con tus credenciales.');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.message || 'Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'check') return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
      <Loader2 className="w-8 h-8 animate-spin text-[#4f46e5]" />
    </div>
  );

  if (step === 'error') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#fcfcfc]">
      <AlertCircle className="w-10 h-10 text-red-400 mb-2"/>
      <p className="text-sm text-slate-500 max-w-xs">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 text-xs font-bold text-[#4f46e5] uppercase tracking-widest">
        Reintentar
      </button>
    </div>
  );

  if (isComplete) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfc]">
      <CheckCircle2 className="w-12 h-12 text-green-500 mb-4"/>
      <h2 className="text-xl font-bold">Configuración completa</h2>
      <p className="text-sm text-slate-500 mt-1">Redirigiendo al login...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[360px]">
        <div className="flex flex-col items-center mb-10">
          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm mb-5">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Primer Registro</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium text-center">
            Crea la cuenta Super Admin de la plataforma
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" required value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  className="input-field pl-10" placeholder="Nombre completo" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" required value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="input-field pl-10" placeholder="admin@ejemplo.com" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" required minLength={8} value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="input-field pl-10" placeholder="Mínimo 8 caracteres" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Confirmar</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" required minLength={8} value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="input-field pl-10" placeholder="Repite la contraseña" />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-[11px] font-bold flex items-center gap-2 leading-tight">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="btn-primary w-full py-2.5 rounded-md text-sm font-bold flex items-center justify-center gap-2 mt-4">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Super Admin'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default FirstSetup;
