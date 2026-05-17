import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  // loading=true solo hasta que se resuelve la sesión inicial
  const [loading, setLoading] = useState(true);
  // Evita que onAuthStateChange procese INITIAL_SESSION (ya lo maneja getSession)
  const initializedRef = useRef(false);

  const fetchPerfil = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setPerfil(data);
    } catch (error) {
      console.error('Error fetching perfil de Supabase:', error);
      setPerfil(null);
    }
  }, []);

  useEffect(() => {
    // 1. Resolver la sesión inicial UNA SOLA VEZ
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchPerfil(session.user.id).finally(() => {
          initializedRef.current = true;
          setLoading(false);
        });
      } else {
        initializedRef.current = true;
        setLoading(false);
      }
    });

    // 2. Escuchar cambios POSTERIORES a la inicialización
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Ignorar el evento inicial — ya fue manejado por getSession()
      if (!initializedRef.current) return;

      // Estos eventos no requieren bloquear la UI con spinner:
      // - TOKEN_REFRESHED: refresco silencioso al restaurar la ventana
      // - INITIAL_SESSION: ya manejado arriba
      if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (session) setUser(session.user);
        return;
      }

      // Para SIGNED_IN, SIGNED_OUT, USER_UPDATED sí actualizamos estado
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setPerfil(null);
        return;
      }

      if (session) {
        setUser(session.user);
        // Actualizar perfil en background sin mostrar spinner global
        fetchPerfil(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchPerfil]);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // onAuthStateChange manejará el SIGNED_IN y actualizará user/perfil
      return data;
    } catch (error) {
      console.error('Error login Supabase:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // onAuthStateChange manejará el SIGNED_OUT
    } catch (error) {
      console.error('Error logout Supabase:', error);
      setUser(null);
      setPerfil(null);
    }
  };

  const refreshPerfil = async () => {
    if (user) {
      await fetchPerfil(user.id);
    }
  };

  const rol = perfil?.rol ?? null;
  const ieId = perfil?.ie_id ?? null;
  const esSuperAdmin = rol === 'super_admin';
  const esAdmin = rol === 'admin';
  const esDirectivo = ['admin', 'director', 'subdirector'].includes(rol);

  const value = {
    user,
    perfil,
    rol,
    ieId,
    esSuperAdmin,
    esAdmin,
    esDirectivo,
    loading,
    login,
    logout,
    refreshPerfil
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
