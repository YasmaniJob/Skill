import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { showErrorToast, getErrorMessage } from '../lib/errorUtils';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [dbEmpty, setDbEmpty] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkDB = async () => {
      const { data, error } = await supabase.rpc('db_is_empty');
      if (!error && data) setDbEmpty(true);
    };
    checkDB();
  }, []);

  if (user) return <Navigate to="/" replace />;
  if (dbEmpty) return <Navigate to="/setup" replace />;

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
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[360px]"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
            <img src="/logo.png" alt="Skill Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ingresar a Skill
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Gestión Pedagógica de Alto Rendimiento
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#4f46e5] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="nombre@ejemplo.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">
                Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#4f46e5] transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {authError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-100 rounded-md flex items-center gap-2.5 text-red-600 text-[11px] font-bold"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {authError}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5 rounded-md text-sm font-bold flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
            Exclusivo para instituciones educativas<br/>
            del Perú &copy; {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
