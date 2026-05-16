import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth.jsx';
import { toast } from 'react-hot-toast';

export const usePeriodos = () => {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, perfil, ieId } = useAuth();

  const fetchPeriodos = useCallback(async () => {
    if (!ieId) { setPeriodos([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('periodos_monitoreo')
      .select(`
        *,
        total_monitoreos:monitoreos(count)
      `)
      .eq('ie_id', ieId)
      .order('anio', { ascending: false })
      .order('numero_visita', { ascending: true });

    if (error) {
      console.error(error);
      toast.error('Error al cargar los periodos');
    } else {
      setPeriodos(data || []);
    }
    setLoading(false);
  }, [ieId]);

  useEffect(() => { fetchPeriodos(); }, [fetchPeriodos, ieId]);

  const createPeriodo = async (formData) => {
    const nombre = `Visita ${formData.numero_visita} - ${formData.anio}`;
    const insertData = { ...formData, nombre, registrado_por: perfil?.id };
    if (ieId) insertData.ie_id = ieId;
    const { error } = await supabase
      .from('periodos_monitoreo')
      .insert([insertData]);

    if (error) {
      console.error(error);
      toast.error('Error al crear el periodo');
      return false;
    }
    toast.success(`Periodo "${nombre}" creado`);
    fetchPeriodos();
    return true;
  };

  const toggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'activo' ? 'cerrado' : 'activo';
    const { error } = await supabase
      .from('periodos_monitoreo')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (error) { toast.error('Error al actualizar estado'); return; }
    toast.success(nuevoEstado === 'activo' ? 'Periodo reabierto' : 'Periodo cerrado');
    fetchPeriodos();
  };

  const deletePeriodo = async (id) => {
    const { error } = await supabase
      .from('periodos_monitoreo')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('No se puede eliminar: tiene registros asociados');
      return false;
    }
    toast.success('Periodo eliminado');
    fetchPeriodos();
    return true;
  };

  const periodosActivos = periodos.filter(p => p.estado === 'activo');

  return {
    periodos,
    periodosActivos,
    loading,
    createPeriodo,
    toggleEstado,
    deletePeriodo,
    refresh: fetchPeriodos,
  };
};
