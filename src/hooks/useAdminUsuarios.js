import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient'; // Cliente normal (admin logueado)
import { toast } from 'react-hot-toast';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Cliente temporal sin persistencia de sesión.
// Esto permite crear usuarios con signUp() sin desloguear al admin actual.
// REQUISITO: Desactivar "Confirm email" en Supabase Dashboard →
//            Authentication → Settings → Email Auth → "Confirm email" OFF
const SERVICE_ROLE_KEY = (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '').trim();

// Cliente con service role para gestión administrativa (password reset, etc.)
const adminClient = SERVICE_ROLE_KEY 
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Cliente temporal para signUp sin afectar la sesión actual
const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const useAdminUsuarios = () => {
  const [loading, setLoading] = useState(false);

  const upsertUsuario = async ({ email, password, nombre, rol, dni }) => {
    setLoading(true);
    try {
      let userId;
      const paddedDni = dni || password; // El DNI es el password inicial

      // 1. Intentar crear el usuario con signUp
      const { data: signUpData, error: signUpError } = await tempClient.auth.signUp({
        email,
        password: paddedDni,
      });

      if (signUpError) {
        // Si el usuario ya existe, intentamos obtener su ID
        if (signUpError.message.toLowerCase().includes('already registered') ||
            signUpError.message.toLowerCase().includes('user already')) {
          
          // Buscar ID por email (necesitamos adminClient para esto o buscar en perfiles)
          let existingId;
          const { data: profile } = await supabase.from('perfiles').select('id').eq('nombre', nombre).maybeSingle();
          
          if (profile) {
            existingId = profile.id;
          } else if (adminClient) {
            // Si no hay perfil pero hay adminClient, buscamos en auth.users
            const { data: { users } } = await adminClient.auth.admin.listUsers();
            const foundUser = users.find(u => u.email === email);
            if (foundUser) existingId = foundUser.id;
          }

          if (existingId) {
            userId = existingId;
            // IMPORTANTE: Sincronizar contraseña si tenemos adminClient
            // Esto arregla los casos donde el DNI estaba truncado a 7 dígitos
            if (adminClient) {
              await adminClient.auth.admin.updateUserById(userId, { password: paddedDni });
            }
          } else {
            throw new Error(`El usuario ${email} ya existe pero no se pudo vincular su ID.`);
          }
        } else {
          throw signUpError;
        }
      } else if (signUpData?.user) {
        userId = signUpData.user.id;
      }

      // 2. Guardar el perfil
      const { error: profileError } = await supabase
        .from('perfiles')
        .upsert([{ id: userId, rol, nombre, dni: paddedDni, debe_cambiar_pass: true }]);

      if (profileError) throw profileError;

      toast.success(`Acceso procesado para ${email}`);
      return true;

    } catch (error) {
      console.error('Error gestionando usuario:', error);
      toast.error(`Error con ${email}: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordToDNI = async (userId, dni) => {
    setLoading(true);
    try {
      // Llamamos a la función Postgres con SECURITY DEFINER
      // Esto evita exponer el service role key en el browser
      const { data, error } = await supabase.rpc('reset_password_to_dni', {
        target_user_id: userId,
        dni_value: String(dni),
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Error desconocido');

      toast.success('Contraseña reseteada al DNI. El usuario deberá cambiarla al ingresar.');
      return true;
    } catch (error) {
      console.error('Error al resetear:', error);
      toast.error('Error al resetear: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

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

  return { upsertUsuario, bulkUpsertUsuarios, resetPasswordToDNI, loading };
};
