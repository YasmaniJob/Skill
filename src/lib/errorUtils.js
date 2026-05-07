import { toast } from 'react-hot-toast';

/**
 * Mapea errores de Supabase/PostgREST a mensajes amigables en español.
 */
export const getErrorMessage = (error) => {
  if (!error) return 'Ha ocurrido un error inesperado';

  // Errores de PostgREST / RLS
  if (error.code === '42501') {
    return 'No tienes permisos suficientes para realizar esta acción';
  }

  // Errores de Autenticación
  if (error.status === 400 || error.message === 'Invalid login credentials') {
    return 'Credenciales inválidas. Por favor, verifica tu correo y contraseña';
  }

  if (error.message === 'Email not confirmed') {
    return 'Por favor, confirma tu correo electrónico antes de iniciar sesión';
  }

  // Errores de Red
  if (error.message === 'Failed to fetch') {
    return 'Error de conexión. Verifica tu internet';
  }

  // Errores de Validación (Constraint violations)
  if (error.code === '23505') {
    return 'Este registro ya existe en el sistema';
  }

  return error.message || 'Error en la operación';
};

/**
 * Muestra un toast de error con un mensaje procesado.
 */
export const showErrorToast = (error, fallbackMessage) => {
  const message = getErrorMessage(error);
  toast.error(message || fallbackMessage);
};
