import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPerfil = async (userId) => {
    if (!userId) { setPerfil(null); return; }
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();
    setPerfil(data || null);
  };

  // Permite refrescar el perfil en caliente sin recargar la sesión
  const refreshPerfil = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      await fetchPerfil(session.user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      await fetchPerfil(session?.user?.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      fetchPerfil(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setPerfil(null);
  };

  // Helpers de rol
  const rol = perfil?.rol ?? null;
  const esAdmin = rol === 'admin';
  const esDirectivo = ['admin', 'director', 'subdirector'].includes(rol);

  return (
    <AuthContext.Provider value={{ user, perfil, rol, esAdmin, esDirectivo, loading, login, logout, refreshPerfil }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
