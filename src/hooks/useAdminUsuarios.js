import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth.jsx';
import { toast } from 'react-hot-toast';

// Eliminado adminClient para mejorar seguridad. 
// Toda la lógica administrativa ahora se maneja vía RPC en el servidor.

export const useAdminUsuarios = () => {
  const [loading, setLoading] = useState(false);
  const { ieId } = useAuth();

  /**
   * Crea o actualiza un usuario.
   *
   * Flujo:
   * 1. Admin API crea el usuario en auth (con identities correctas → login funciona)
   * 2. Upsert del perfil en public.perfiles vinculado por auth_user_id
   *
   * Contraseña inicial = DNI (8 dígitos).
   */
  const upsertUsuario = async ({ email, nombre, rol, dni }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('crear_usuario_con_dni', {
        p_email: email,
        p_nombre: nombre,
        p_dni: dni,
        p_rol: rol,
        p_ie_id: ieId
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error);

      toast.success(data.message || 'Usuario procesado correctamente.');
      return true;
    } catch (error) {
      console.error('upsertUsuario:', error);
      toast.error(`Error: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina un usuario: perfil + cuenta auth.
   */
  const eliminarUsuario = async (perfilId, nombre) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('eliminar_usuario', {
        p_perfil_id: perfilId
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error);

      toast.success(`Usuario "${nombre}" eliminado del sistema.`);
      return true;
    } catch (error) {
      console.error('eliminarUsuario:', error);
      toast.error('Error al eliminar: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resetea la contraseña de un usuario a su DNI.
   */
  const resetPasswordToDNI = async (perfilId, dni) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('reset_password_to_dni', {
        p_perfil_id: perfilId,
        p_dni: dni
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error);

      toast.success('Contraseña reseteada al DNI. El usuario deberá cambiarla al ingresar.');
      return true;
    } catch (error) {
      console.error('resetPasswordToDNI:', error);
      toast.error('Error al resetear: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga masiva secuencial.
   */
  const bulkUpsertUsuarios = async (usuariosList) => {
    let successCount = 0;
    for (const user of usuariosList) {
      const ok = await upsertUsuario(user);
      if (ok) successCount++;
    }
    if (successCount > 0) {
      toast.success(`${successCount} de ${usuariosList.length} usuarios procesados.`);
    }
    return successCount === usuariosList.length;
  };

  return { upsertUsuario, bulkUpsertUsuarios, resetPasswordToDNI, eliminarUsuario, loading };
};
