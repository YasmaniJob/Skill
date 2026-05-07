import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth.jsx';
import { toast } from 'react-hot-toast';

export const useMonitoreos = (filters = {}) => {
  const [monitoreos, setMonitoreos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMonitoreos = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('monitoreos')
        .select(`
          *,
          periodo:periodos_monitoreo(id, nombre, numero_visita, anio)
        `)
        .order('created_at', { ascending: false });

      // Filtros
      if (filters.periodo_id) query = query.eq('periodo_id', filters.periodo_id);
      if (filters.area)       query = query.eq('area', filters.area);
      if (filters.grado)      query = query.eq('grado', filters.grado);
      if (filters.seccion)    query = query.eq('seccion', filters.seccion);
      if (filters.docente_id) query = query.eq('dni_docente', filters.docente_id);
      if (filters.nombre)     query = query.ilike('nombre_docente', `%${filters.nombre}%`);
      if (filters.fechaDesde) query = query.gte('fecha', filters.fechaDesde);
      if (filters.fechaHasta) query = query.lte('fecha', filters.fechaHasta);

      const { data, error } = await query;
      if (error) throw error;
      setMonitoreos(data || []);
    } catch (error) {
      console.error('Error fetching monitoreos:', error);
      toast.error('Error al cargar los registros');
    } finally {
      setLoading(false);
    }
  }, [
    filters.periodo_id,
    filters.area,
    filters.grado,
    filters.seccion,
    filters.docente_id,
    filters.nombre,
    filters.fechaDesde,
    filters.fechaHasta,
  ]);

  useEffect(() => { fetchMonitoreos(); }, [fetchMonitoreos]);

  const addMonitoreo = async (data) => {
    try {
      const { error } = await supabase
        .from('monitoreos')
        .insert([{ ...data, registrado_por: user.id }]);

      if (error) throw error;
      toast.success('Registro guardado exitosamente');
      fetchMonitoreos();
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el registro');
      return false;
    }
  };

  const deleteMonitoreo = async (id) => {
    try {
      const { error } = await supabase
        .from('monitoreos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Registro eliminado');
      fetchMonitoreos();
      return true;
    } catch (error) {
      console.error(error);
      toast.error('No tienes permiso para eliminar este registro');
      return false;
    }
  };

  return { monitoreos, loading, addMonitoreo, deleteMonitoreo, refresh: fetchMonitoreos };
};
