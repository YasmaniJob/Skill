import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth.jsx';
import { toast } from 'react-hot-toast';

export const usePeriodos = () => {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, ieId } = useAuth();

  const fetchPeriodos = useCallback(async () => {
    if (!ieId) { setPeriodos([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('periodos')
        .select('*')
        .eq('ie_id', ieId)
        .order('anio', { ascending: false })
        .order('numero_visita', { ascending: true });
      if (error) throw error;
      setPeriodos(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar los periodos');
    } finally {
      setLoading(false);
    }
  }, [ieId]);

  useEffect(() => { fetchPeriodos(); }, [fetchPeriodos]);

  const createPeriodo = async (formData) => {
    const nombre = `Visita ${formData.numero_visita} - ${formData.anio}`;
    try {
      const { error } = await supabase
        .from('periodos')
        .insert({
          nombre,
          numero_visita: Number(formData.numero_visita),
          anio: Number(formData.anio),
          fecha_inicio: formData.fecha_inicio || null,
          fecha_fin: formData.fecha_fin || null,
          ie_id: ieId,
          registrado_por: user?.id,
          estado: 'activo'
        });
      if (error) throw error;

      toast.success(`Periodo "${nombre}" creado`);
      fetchPeriodos();
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Error al crear el periodo');
      return false;
    }
  };

  const toggleEstado = async (id, estadoActual) => {
    try {
      const nuevoEstado = estadoActual === 'activo' ? 'cerrado' : 'activo';
      const { error } = await supabase
        .from('periodos')
        .update({ estado: nuevoEstado })
        .eq('id', id);
      if (error) throw error;

      toast.success(nuevoEstado === 'activo' ? 'Periodo reabierto' : 'Periodo cerrado');
      fetchPeriodos();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const deletePeriodo = async (id) => {
    try {
      const { error } = await supabase
        .from('periodos')
        .delete()
        .eq('id', id);
      if (error) throw error;

      toast.success('Periodo eliminado');
      fetchPeriodos();
      return true;
    } catch (error) {
      toast.error('No se puede eliminar: tiene registros asociados');
      return false;
    }
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
