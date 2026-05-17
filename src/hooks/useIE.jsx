import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const IEContext = createContext({});

export const IEProvider = ({ children }) => {
  const [iesDisponibles, setIesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIE = useCallback(async (ieId) => {
    if (!ieId) return null;
    try {
      const { data, error } = await supabase
        .from('instituciones')
        .select('*')
        .eq('id', ieId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching IE:', error);
      return null;
    }
  }, []);

  const refreshIes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('instituciones')
        .select('*')
        .order('nombre');
      if (error) throw error;
      setIesDisponibles(data || []);
    } catch (error) {
      console.error('Error refreshing IEs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshIes();
  }, [refreshIes]);

  return (
    <IEContext.Provider value={{ iesDisponibles, loading, fetchIE, refreshIes }}>
      {children}
    </IEContext.Provider>
  );
};

export const useIE = () => useContext(IEContext);
