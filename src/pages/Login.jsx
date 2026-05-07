import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Monitor, Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { showErrorToast, getErrorMessage } from '../lib/errorUtils';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      await login(email, password);
      toast.success('¡Bienvenido de nuevo!');
      navigate('/');
    } catch (error) {
      console.error(error);
      showErrorToast(error, 'Error al iniciar sesión');
      setAuthError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Background with Image */}
      <div 
        className="absolute inset-0 z-0 scale-105"
        style={{
          backgroundImage: 'url(/login_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7) blur(4px)'
        }}
      />
      
      {/* Decorative Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-900/60 via-transparent to-sky-900/40" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 w-full max-w-[440px]"
      >
        {/* Glass Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 p-8 md:p-12">
          
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex p-4 bg-sky-600 rounded-3xl mb-6 shadow-lg shadow-sky-200"
            >
              <Monitor className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">
              Skill
            </h1>
            <div className="h-1 w-12 bg-sky-600 mx-auto rounded-full mb-3" />
            <p className="text-slate-500 font-medium text-sm">
              Gestión Pedagógica y Monitoreo 2026
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Correo Institucional
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-300 group-focus-within:text-sky-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-2xl text-slate-700 font-bold transition-all outline-none"
                  placeholder="usuario@colegio.edu.pe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-sky-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-2xl text-slate-700 font-bold transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{authError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-500 group-hover:scale-105 transition-transform duration-300" />
              <div className="relative flex items-center justify-center gap-3 py-4 px-6 text-white font-black uppercase tracking-widest text-sm disabled:opacity-70">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    Ingresar al Panel
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
              Sistema exclusivo para personal directivo<br/>
              Instituciones Educativas del Perú
            </p>
          </div>
        </div>
      </motion.div>

      {/* Aesthetic Floating Elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-sky-500/10 rounded-full blur-[100px] z-0" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] z-0" />
    </div>
  );
};

export default Login;
