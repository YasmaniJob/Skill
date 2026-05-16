import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';

// Eliminado adminClient para mejorar seguridad. 
// Toda la lógica administrativa ahora se maneja vía RPC en el servidor.

export const useInstituciones = () => {
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInstituciones = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('instituciones_educativas')
      .select(`
        *,
        total_docentes:docentes(count),
        total_monitoreos:monitoreos(count),
        admin:perfiles!perfiles_ie_id_fkey(id, nombre, dni, rol)
      `)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error fetching instituciones:', error);
      toast.error('Error al cargar las instituciones');
    } else {
      const iesConAdmin = (data || []).map(ie => ({
        ...ie,
        admin: ie.admin?.find(p => p.rol === 'admin') ?? null,
      }));
      setInstituciones(iesConAdmin);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchInstituciones(); }, [fetchInstituciones]);

  /**
   * Crea una IE y su admin.
   * Usa Admin API para crear el usuario auth — garantiza auth.identities → login funciona.
   */
  const createInstitucion = async ({ nombre, codigo_minedu, direccion, ugel, admin_email, admin_nombre, admin_dni }) => {
    try {
      const { data, error } = await supabase.rpc('crear_ie_con_admin', {
        p_nombre: nombre,
        p_admin_email: admin_email,
        p_admin_nombre: admin_nombre,
        p_admin_dni: admin_dni,
        p_codigo_minedu: codigo_minedu || null,
        p_direccion: direccion || null,
        p_ugel: ugel || null
      });

      if (error) throw error;

      if (data && !data.success) {
        throw new Error(data.error || 'Error desconocido al crear la IE');
      }

      toast.success(data.message || `IE "${nombre}" creada exitosamente.`);
      fetchInstituciones();
      return true;
    } catch (error) {
      console.error('Error creando IE:', error);
      toast.error(`Error al crear la IE: ${error.message}`);
      return false;
    }
  };

  const toggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    const { error } = await supabase
      .from('instituciones_educativas')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (error) { toast.error('Error al actualizar estado'); return; }
    toast.success(nuevoEstado === 'activo' ? 'IE activada' : 'IE desactivada');
    fetchInstituciones();
  };

  return { instituciones, loading, createInstitucion, toggleEstado, refresh: fetchInstituciones };
};
