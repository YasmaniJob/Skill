import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const IEContext = createContext({});

export const IEProvider = ({ children }) => {
  const [iesDisponibles, setIesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIE = useCallback(async (ieId) => {
    if (!ieId) return null;
    const { data } = await supabase
      .from('instituciones_educativas')
      .select('*')
      .eq('id', ieId)
      .single();
    return data;
  }, []);

  const refreshIes = useCallback(async () => {
    const { data } = await supabase
      .from('instituciones_educativas')
      .select('id, nombre, codigo_minedu, estado')
      .order('nombre', { ascending: true });
    setIesDisponibles(data || []);
  }, []);

  useEffect(() => {
    refreshIes();
    setLoading(false);
  }, [refreshIes]);

  return (
    <IEContext.Provider value={{ iesDisponibles, loading, fetchIE, refreshIes }}>
      {children}
    </IEContext.Provider>
  );
};

export const useIE = () => useContext(IEContext);
