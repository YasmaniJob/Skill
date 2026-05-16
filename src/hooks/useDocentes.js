import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth.jsx';
import { toast } from 'react-hot-toast';

export const useDocentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ieId } = useAuth();

  const fetchDocentes = useCallback(async () => {
    if (!ieId) { setDocentes([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('docentes')
      .select('*')
      .eq('ie_id', ieId)
      .order('nombre_completo', { ascending: true });

    if (error) {
      console.error('Error fetching docentes:', error);
      toast.error('Error al cargar la lista de docentes');
    } else {
      setDocentes(data || []);
    }
    setLoading(false);
  }, [ieId]);

  useEffect(() => {
    fetchDocentes();
  }, [fetchDocentes]);

  const upsertDocente = async (docente) => {
    // Asegurar que el DNI tenga 8 dígitos
    const cleanDocente = { 
      ...docente, 
      dni: String(docente.dni).trim().padStart(8, '0'),
    };
    if (ieId) cleanDocente.ie_id = ieId;
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
    const docentesConIE = ieId
      ? docentesList.map(d => ({ ...d, ie_id: ieId }))
      : docentesList;
    // Deduplicar la lista por DNI antes de enviar a Supabase para evitar el error 21000
    // (ON CONFLICT DO UPDATE cannot affect row a second time)
    const uniqueDocentes = Array.from(
      docentesConIE.reduce((map, item) => {
        const dni = String(item.dni).trim().padStart(8, '0');
        map.set(dni, { ...item, dni });
        return map;
      }, new Map()).values()
    );

    const { error } = await supabase
      .from('docentes')
      .upsert(uniqueDocentes, { onConflict: 'dni' });

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
