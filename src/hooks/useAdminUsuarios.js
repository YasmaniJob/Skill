import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth.jsx';
import { toast } from 'react-hot-toast';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SERVICE_ROLE_KEY = (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '').trim();

// Cliente admin con service role.
// Usado para crear/eliminar usuarios via Admin API de GoTrue —
// el único camino que crea correctamente auth.identities y permite login.
const adminClient = SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

if (!adminClient) {
  console.warn('[useAdminUsuarios] VITE_SUPABASE_SERVICE_ROLE_KEY no configurado. La gestión de usuarios no funcionará.');
}

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
    if (!adminClient) {
      toast.error('Service role key no configurado.');
      return false;
    }
    setLoading(true);
    try {
      const paddedDni = String(dni || '').trim().padStart(8, '0');
      if (paddedDni === '00000000') throw new Error('El DNI es obligatorio.');
      const cleanEmail = email.trim().toLowerCase();

      // 1. Buscar si el usuario ya existe en auth
      let authUserId = null;
      const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) throw listError;
      const existing = users?.find(u => u.email === cleanEmail);

      if (existing) {
        authUserId = existing.id;
        // Actualizar contraseña al nuevo DNI
        await adminClient.auth.admin.updateUserById(authUserId, { password: paddedDni });
      } else {
        // Crear usuario via Admin API — GoTrue crea identities correctamente
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: cleanEmail,
          password: paddedDni,
          email_confirm: true,
          user_metadata: { nombre },
        });
        if (createError) throw createError;
        authUserId = newUser.user.id;
      }

      // 2. Upsert perfil
      const perfilData = {
        auth_user_id: authUserId,
        rol,
        nombre: nombre.trim(),
        dni: paddedDni,
        debe_cambiar_pass: true,
      };
      if (ieId) perfilData.ie_id = ieId;

      const { error: perfilError } = await supabase
        .from('perfiles')
        .upsert([perfilData], { onConflict: 'auth_user_id' });
      if (perfilError) throw perfilError;

      toast.success(existing
        ? `Perfil actualizado para ${cleanEmail}.`
        : `Acceso creado para ${cleanEmail}. Contraseña inicial: DNI ${paddedDni}`
      );
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
    if (!adminClient) {
      toast.error('Service role key no configurado.');
      return false;
    }
    setLoading(true);
    try {
      // Obtener auth_user_id del perfil
      const { data: perfil, error: fetchError } = await supabase
        .from('perfiles')
        .select('auth_user_id, rol')
        .eq('id', perfilId)
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (!perfil) throw new Error('Perfil no encontrado.');
      if (perfil.rol === 'super_admin') throw new Error('No se puede eliminar un super_admin.');

      // Eliminar perfil primero (monitoreos.registrado_por → SET NULL automático)
      const { error: deletePerfilError } = await supabase
        .from('perfiles')
        .delete()
        .eq('id', perfilId);
      if (deletePerfilError) throw deletePerfilError;

      // Eliminar cuenta auth si existe
      if (perfil.auth_user_id) {
        const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(perfil.auth_user_id);
        if (deleteAuthError) throw deleteAuthError;
      }

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
    if (!adminClient) {
      toast.error('Service role key no configurado.');
      return false;
    }
    setLoading(true);
    try {
      const paddedDni = String(dni).trim().padStart(8, '0');

      const { data: perfil, error: fetchError } = await supabase
        .from('perfiles')
        .select('auth_user_id')
        .eq('id', perfilId)
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (!perfil?.auth_user_id) throw new Error('Usuario sin cuenta auth.');

      const { error } = await adminClient.auth.admin.updateUserById(perfil.auth_user_id, {
        password: paddedDni,
      });
      if (error) throw error;

      await supabase.from('perfiles').update({ debe_cambiar_pass: true }).eq('id', perfilId);

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
