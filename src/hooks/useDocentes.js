import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth.jsx';
import { toast } from 'react-hot-toast';

export const useDocentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ieId } = useAuth();

  const fetchDocentes = useCallback(async () => {
    if (!ieId) { setDocentes([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('docentes')
        .select('*')
        .eq('ie_id', ieId)
        .order('nombre_completo');
      if (error) throw error;
      setDocentes(data || []);
    } catch (error) {
      console.error('Error fetching docentes:', error);
      toast.error('Error al cargar la lista de docentes');
    } finally {
      setLoading(false);
    }
  }, [ieId]);

  useEffect(() => {
    fetchDocentes();
  }, [fetchDocentes]);

  const upsertDocente = async (docente) => {
    const Dni = String(docente.dni).trim().padStart(8, '0');
    const data = {
      dni: Dni,
      nombre_completo: docente.nombre_completo,
      area_principal: docente.area_principal,
      ie_id: ieId
    };

    if (docente.id) {
      data.id = docente.id;
    }

    try {
      const { error } = await supabase
        .from('docentes')
        .upsert(data, { onConflict: 'dni,ie_id' });
      if (error) throw error;

      toast.success('Docente guardado exitosamente');
      fetchDocentes();
      return true;
    } catch (error) {
      console.error('Error in upsertDocente:', error);
      toast.error('Error al guardar el docente');
      return false;
    }
  };

  const deleteDocente = async (id) => {
    try {
      const { error } = await supabase
        .from('docentes')
        .delete()
        .eq('id', id);
      if (error) throw error;

      toast.success('Docente eliminado');
      fetchDocentes();
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar el docente. Es posible que tenga monitoreos registrados.');
      return false;
    }
  };

  const bulkUpsertDocentes = async (docentesList) => {
    setLoading(true);
    try {
      const formattedList = docentesList.map(d => ({
        dni: String(d.dni).trim().padStart(8, '0'),
        nombre_completo: String(d.nombre_completo).trim(),
        area_principal: String(d.area_principal || '').trim(),
        ie_id: ieId
      }));

      // Deduplicar por DNI para evitar el error de Postgres 21000 en la carga masiva
      const uniqueMap = {};
      formattedList.forEach(docente => {
        uniqueMap[docente.dni] = docente;
      });
      const uniqueList = Object.values(uniqueMap);
      const duplicatesCount = formattedList.length - uniqueList.length;

      const { error } = await supabase
        .from('docentes')
        .upsert(uniqueList, { onConflict: 'dni,ie_id' });

      if (error) throw error;

      if (duplicatesCount > 0) {
        toast.success(`${uniqueList.length} docentes procesados (${duplicatesCount} filas duplicadas ignoradas)`);
      } else {
        toast.success(`${uniqueList.length} docentes procesados correctamente`);
      }
      fetchDocentes();
      return true;
    } catch (error) {
      console.error('Error in bulkUpsertDocentes:', error);
      toast.error('Error en la carga masiva');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { docentes, loading, upsertDocente, deleteDocente, bulkUpsertDocentes, refresh: fetchDocentes };
};
