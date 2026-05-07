-- ============================================================
-- PASO 1: Habilitar pgcrypto (para resetear contraseñas)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- PASO 2: Función para que el PROPIO usuario marque que ya
-- no necesita cambiar su contraseña (omitir o después de cambiar).
-- SECURITY DEFINER: omite RLS y corre como superusuario.
-- Solo puede afectar el registro del propio usuario (auth.uid()).
-- ============================================================
CREATE OR REPLACE FUNCTION skip_password_change()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE perfiles
  SET debe_cambiar_pass = false
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Perfil no encontrado.');
  END IF;

  RETURN json_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Solo usuarios autenticados pueden llamar esta función
REVOKE ALL ON FUNCTION skip_password_change() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION skip_password_change() TO authenticated;


-- ============================================================
-- PASO 3: Función para resetear contraseña al DNI (solo admin)
-- ============================================================
CREATE OR REPLACE FUNCTION reset_password_to_dni(
  target_user_id uuid,
  dni_value text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  caller_rol text;
  padded_dni text;
BEGIN
  -- Verificar que el solicitante es admin
  SELECT rol INTO caller_rol FROM perfiles WHERE id = auth.uid();
  
  IF caller_rol != 'admin' THEN
    RETURN json_build_object('success', false, 'error', 'No autorizado.');
  END IF;

  padded_dni := lpad(dni_value, 8, '0');

  UPDATE auth.users
  SET 
    encrypted_password = extensions.crypt(padded_dni, extensions.gen_salt('bf')),
    updated_at = now()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Usuario no encontrado.');
  END IF;

  UPDATE perfiles
  SET debe_cambiar_pass = true
  WHERE id = target_user_id;

  RETURN json_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION reset_password_to_dni(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reset_password_to_dni(uuid, text) TO authenticated;
