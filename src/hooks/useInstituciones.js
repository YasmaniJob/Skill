import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SERVICE_ROLE_KEY = (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '').trim();

const adminClient = SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

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
    if (!adminClient) {
      toast.error('Service role key no configurado.');
      return false;
    }
    try {
      const paddedDni = String(admin_dni || '').trim().padStart(8, '0');
      const cleanEmail = admin_email.trim().toLowerCase();

      // 1. Crear la IE
      const { data: ie, error: ieError } = await supabase
        .from('instituciones_educativas')
        .insert([{
          nombre,
          codigo_minedu: codigo_minedu || null,
          direccion: direccion || null,
          ugel: ugel || null,
        }])
        .select('id')
        .single();
      if (ieError) throw ieError;

      // 2. Crear usuario admin via Admin API (crea auth.identities correctamente)
      let authUserId;
      const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) throw listError;
      const existing = users?.find(u => u.email === cleanEmail);

      if (existing) {
        authUserId = existing.id;
        await adminClient.auth.admin.updateUserById(authUserId, { password: paddedDni });
      } else {
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: cleanEmail,
          password: paddedDni,
          email_confirm: true,
          user_metadata: { nombre: admin_nombre },
        });
        if (createError) throw createError;
        authUserId = newUser.user.id;
      }

      // 3. Crear perfil admin vinculado a la IE
      const { error: perfilError } = await supabase
        .from('perfiles')
        .upsert([{
          auth_user_id: authUserId,
          rol: 'admin',
          nombre: admin_nombre.trim(),
          dni: paddedDni,
          ie_id: ie.id,
          debe_cambiar_pass: true,
        }], { onConflict: 'auth_user_id' });
      if (perfilError) throw perfilError;

      toast.success(`IE "${nombre}" creada. Admin: ${cleanEmail} · Contraseña inicial: DNI ${paddedDni}`);
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
