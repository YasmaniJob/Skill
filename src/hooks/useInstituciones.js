import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export const useInstituciones = () => {
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInstituciones = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('instituciones')
        .select('*, profiles!ie_id(*)')
        .order('nombre');

      if (error) throw error;

      // Procesar para que coincida con la estructura esperada por la UI
      const iesConAdmin = (data || []).map(ie => ({
        ...ie,
        admin: ie.profiles?.find(u => u.rol === 'admin') ?? null,
        total_docentes: 0,
        total_monitoreos: 0
      }));

      setInstituciones(iesConAdmin);
    } catch (error) {
      console.error('Error fetching instituciones:', error);
      toast.error('Error al cargar las instituciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInstituciones(); }, [fetchInstituciones]);

  const createInstitucion = async ({ nombre, codigo_minedu, direccion, ugel, admin_email, admin_nombre, admin_dni }) => {
    try {
      // 1. Crear la Institución
      const { data: ie, error: ieError } = await supabase
        .from('instituciones')
        .insert({
          nombre,
          codigo_minedu,
          direccion,
          ugel,
          estado: 'activo'
        })
        .select('id')
        .single();

      if (ieError) throw ieError;

      // 2. Crear el usuario Admin para esa IE llamando a la función RPC
      const { error: rpcError } = await supabase
        .rpc('create_institutional_user', {
          p_email: admin_email,
          p_password: admin_dni, // contraseña inicial = DNI
          p_nombre: admin_nombre,
          p_dni: admin_dni,
          p_rol: 'admin',
          p_ie_id: ie.id
        });

      if (rpcError) throw rpcError;

      toast.success(`IE "${nombre}" creada exitosamente.`);
      fetchInstituciones();
      return true;
    } catch (error) {
      console.error('Error creando IE en Supabase:', error);
      toast.error(`Error al crear la IE: ${error.message}`);
      return false;
    }
  };

  const toggleEstado = async (id, estadoActual) => {
    try {
      const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
      const { error } = await supabase
        .from('instituciones')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(nuevoEstado === 'activo' ? 'IE activada' : 'IE desactivada');
      fetchInstituciones();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  return { instituciones, loading, createInstitucion, toggleEstado, refresh: fetchInstituciones };
};
