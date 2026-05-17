import { toast } from 'react-hot-toast';

/**
 * Mapea errores de Supabase y genéricos a mensajes amigables en español.
 */
export const getErrorMessage = (error) => {
  if (!error) return 'Ha ocurrido un error inesperado';

  // Errores de API
  if (error.status === 401 || error.code === 'PGRST301') {
    return 'No autorizado. Por favor inicia sesión de nuevo';
  }

  if (error.status === 403 || error.code === '42501') {
    return 'No tienes permisos suficientes para realizar esta acción';
  }

  if (error.status === 400 || error.code === '23505') {
    if (error.message?.includes('Invalid login credentials') || error.message?.includes('invalid_credentials')) {
      return 'Credenciales inválidas. Verifica tu correo y contraseña';
    }
    if (error.code === '23505') {
      return 'El registro ya existe en el sistema.';
    }
    return 'Solicitud incorrecta. Verifica los datos enviados';
  }

  // Errores de Red
  if (error.message === 'Failed to fetch') {
    return 'Error de conexión con el servidor. Verifica tu internet';
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
