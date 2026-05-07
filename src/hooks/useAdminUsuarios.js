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
    if (!adminClient) {
      toast.error('No se ha configurado el Service Role Key para esta acción.');
      return false;
    }
    setLoading(true);
    try {
      const { error } = await adminClient.auth.admin.updateUserById(userId, { 
        password: String(dni).padStart(8, '0'),
        user_metadata: { password_reset: true }
      });
      if (error) throw error;
      
      await supabase.from('perfiles').update({ debe_cambiar_pass: true }).eq('id', userId);
      
      toast.success('Contraseña reseteada al DNI (8 dígitos)');
      return true;
    } catch (error) {
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
