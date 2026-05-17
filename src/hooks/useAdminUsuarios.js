import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth.jsx';
import { toast } from 'react-hot-toast';

export const useAdminUsuarios = () => {
  const [loading, setLoading] = useState(false);
  const { ieId } = useAuth();

  const upsertUsuario = async ({ email, nombre, rol, dni }) => {
    setLoading(true);
    try {
      // Buscar si ya existe por DNI o Email
      let { data: existing, error: findError } = await supabase
        .from('profiles')
        .select('*')
        .or(`dni.eq.${dni},email.eq.${email}`)
        .maybeSingle();

      if (findError) throw findError;

      if (existing) {
        // Actualizar perfil existente
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            nombre,
            rol,
            dni,
            ie_id: ieId
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
        toast.success('Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario usando RPC
        const { error: createError } = await supabase.rpc('create_institutional_user', {
          p_email: email,
          p_password: dni, // contraseña inicial = DNI
          p_nombre: nombre,
          p_dni: dni,
          p_rol: rol,
          p_ie_id: ieId
        });

        if (createError) throw createError;
        toast.success('Usuario creado correctamente. Contraseña inicial: ' + dni);
      }
      return true;
    } catch (error) {
      console.error('upsertUsuario Error:', error);
      toast.error(`Error: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (userId, nombre) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('admin_delete_user', { p_user_id: userId });
      if (error) throw error;

      toast.success(`Usuario "${nombre}" eliminado del sistema.`);
      return true;
    } catch (error) {
      console.error('eliminarUsuario Error:', error);
      toast.error('Error al eliminar: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordToDNI = async (userId, dni) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('admin_reset_user_password', {
        p_user_id: userId,
        p_new_password: dni
      });
      if (error) throw error;

      toast.success('Contraseña reseteada al DNI.');
      return true;
    } catch (error) {
      console.error('resetPasswordToDNI Error:', error);
      toast.error('Error al resetear: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpsertUsuarios = async (usuariosList) => {
    setLoading(true);
    let successCount = 0;
    try {
      // 1. Obtener todos los perfiles de la IE actual para búsqueda en memoria
      const { data: existingProfiles, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('ie_id', ieId);

      if (fetchErr) throw fetchErr;

      const emailMap = new Map();
      const dniMap = new Map();

      (existingProfiles || []).forEach(u => {
        if (u.email) emailMap.set(u.email.toLowerCase().trim(), u);
        if (u.dni) dniMap.set(String(u.dni).trim().padStart(8, '0'), u);
      });

      // 2. Procesar la lista secuencialmente
      for (const user of usuariosList) {
        const email = String(user.email || '').toLowerCase().trim();
        const dni = String(user.dni || '').trim().padStart(8, '0');
        const nombre = String(user.nombre || '').trim();
        const rol = user.rol;

        if (!email || !dni) continue;

        let existing = dniMap.get(dni) || emailMap.get(email);

        try {
          if (existing) {
            const { error: updErr } = await supabase
              .from('profiles')
              .update({ nombre, rol, dni })
              .eq('id', existing.id);
            if (updErr) throw updErr;
          } else {
            const { error: rpcErr } = await supabase.rpc('create_institutional_user', {
              p_email: email,
              p_password: dni,
              p_nombre: nombre,
              p_dni: dni,
              p_rol: rol,
              p_ie_id: ieId
            });
            if (rpcErr) throw rpcErr;
          }
          successCount++;
        } catch (err) {
          console.error("Error bulk upsert user:", email, err);
        }
      }

      toast.success(`${successCount} usuarios procesados correctamente`);
      return successCount === usuariosList.length;
    } catch (error) {
      console.error(error);
      toast.error('Error en la carga masiva de usuarios');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { upsertUsuario, bulkUpsertUsuarios, resetPasswordToDNI, eliminarUsuario, loading };
};
