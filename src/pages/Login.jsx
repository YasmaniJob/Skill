import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { showErrorToast, getErrorMessage } from '../lib/errorUtils';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-[#08090a] flex flex-col items-center justify-center p-6 text-[#eeeeee]">
      {/* Glow Effect Background */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#5e6ad2]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#5e6ad2]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[360px]"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.png" alt="Skill Logo" className="w-12 h-12 mb-4" />
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Ingresar a Skill
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Gestión Pedagógica de Alto Rendimiento
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 ml-0.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121316] border border-white/10 rounded-md py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] transition-all"
                placeholder="nombre@ejemplo.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-0.5">
              <label className="text-xs font-medium text-slate-400">
                Contraseña
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121316] border border-white/10 rounded-md py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {authError && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2.5 text-red-400 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {authError}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#5e6ad2] hover:bg-[#6b79e0] text-white py-2.5 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Continuar'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-[11px] text-slate-600">
          Uso exclusivo para instituciones educativas del Perú.<br/>
          &copy; 2026 Skill. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
