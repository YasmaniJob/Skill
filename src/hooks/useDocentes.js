import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';

export const useDocentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocentes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('docentes')
      .select('*')
      .order('nombre_completo', { ascending: true });

    if (error) {
      console.error('Error fetching docentes:', error);
      toast.error('Error al cargar la lista de docentes');
    } else {
      setDocentes(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDocentes();
  }, [fetchDocentes]);

  const upsertDocente = async (docente) => {
    // Asegurar que el DNI tenga 8 dígitos
    const cleanDocente = { 
      ...docente, 
      dni: String(docente.dni).trim().padStart(8, '0') 
    };
    const { error } = await supabase
      .from('docentes')
      .upsert([cleanDocente], { onConflict: 'dni' });

    if (error) {
      console.error(error);
      toast.error('Error al guardar el docente');
      return false;
    }
    fetchDocentes();
    return true;
  };

  const deleteDocente = async (dni) => {
    const { error } = await supabase
      .from('docentes')
      .delete()
      .eq('dni', dni);

    if (error) {
      console.error(error);
      toast.error('Error al eliminar el docente. Es posible que tenga monitoreos registrados.');
      return false;
    }
    toast.success('Docente eliminado');
    fetchDocentes();
    return true;
  };

  // Función para carga masiva
  const bulkUpsertDocentes = async (docentesList) => {
    const { error } = await supabase
      .from('docentes')
      .upsert(docentesList, { onConflict: 'dni' });

    if (error) {
      console.error(error);
      toast.error('Error en la carga masiva');
      return false;
    }
    toast.success(`${docentesList.length} docentes procesados correctamente`);
    fetchDocentes();
    return true;
  };

  return { docentes, loading, upsertDocente, deleteDocente, bulkUpsertDocentes, refresh: fetchDocentes };
};
