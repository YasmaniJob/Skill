-- ============================================================
-- Skill — Schema completo v3
-- ============================================================
-- Arquitectura: perfiles desacoplado de auth.users
--
-- PRINCIPIO CLAVE:
--   perfiles.id       = UUID propio (no depende de auth)
--   perfiles.auth_user_id = referencia a auth.users (ON DELETE SET NULL)
--
-- Ventajas:
--   - El dashboard de Supabase puede eliminar usuarios sin bloqueos
--   - Sin triggers en auth.users (cero acoplamiento con GoTrue)
--   - Perfiles pueden existir sin cuenta auth (y viceversa)
--   - Escalable: un perfil podría tener múltiples cuentas auth en el futuro
-- ============================================================

-- ============================================================
-- 0. EXTENSIONES Y LIMPIEZA
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Eliminar tablas existentes en orden correcto (respeta FKs)
DROP TABLE IF EXISTS public.monitoreos              CASCADE;
DROP TABLE IF EXISTS public.docentes                CASCADE;
DROP TABLE IF EXISTS public.periodos_monitoreo      CASCADE;
DROP TABLE IF EXISTS public.perfiles                CASCADE;
DROP TABLE IF EXISTS public.instituciones_educativas CASCADE;

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS public.current_user_rol()       CASCADE;
DROP FUNCTION IF EXISTS public.current_user_ie_id()     CASCADE;
DROP FUNCTION IF EXISTS public.current_perfil_id()      CASCADE;
DROP FUNCTION IF EXISTS public.db_is_empty()            CASCADE;
DROP FUNCTION IF EXISTS public.register_first_admin(text) CASCADE;
DROP FUNCTION IF EXISTS public.skip_password_change()   CASCADE;
DROP FUNCTION IF EXISTS public.reset_password_to_dni(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.crear_usuario_con_dni(text, text, text, text, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.crear_ie_con_admin(text, text, text, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.eliminar_usuario(uuid)   CASCADE;
-- Funciones del schema anterior (por si existen)
DROP FUNCTION IF EXISTS public.handle_new_user()        CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_deleted()    CASCADE;

-- ============================================================
-- 1. TABLAS
-- ============================================================

-- 1a. instituciones_educativas
CREATE TABLE IF NOT EXISTS public.instituciones_educativas (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        text        NOT NULL,
  codigo_minedu text        UNIQUE,
  direccion     text,
  ugel          text,
  logo_url      text,
  estado        text        NOT NULL DEFAULT 'activo'
                            CHECK (estado IN ('activo', 'inactivo')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 1b. perfiles
-- id propio — NO depende de auth.users
-- auth_user_id — referencia nullable a auth.users, ON DELETE SET NULL
CREATE TABLE IF NOT EXISTS public.perfiles (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id      uuid        UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  rol               text        NOT NULL
                                CHECK (rol IN ('super_admin','admin','director','subdirector','coordinador')),
  nombre            text,
  dni               text,
  ie_id             uuid        REFERENCES public.instituciones_educativas(id) ON DELETE SET NULL,
  debe_cambiar_pass boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- 1c. periodos_monitoreo
CREATE TABLE IF NOT EXISTS public.periodos_monitoreo (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        text        NOT NULL,
  numero_visita integer     NOT NULL CHECK (numero_visita BETWEEN 1 AND 10),
  anio          integer     NOT NULL,
  fecha_inicio  date,
  fecha_fin     date,
  estado        text        NOT NULL DEFAULT 'activo'
                            CHECK (estado IN ('activo', 'cerrado')),
  ie_id         uuid        NOT NULL REFERENCES public.instituciones_educativas(id) ON DELETE CASCADE,
  registrado_por uuid       REFERENCES public.perfiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 1d. docentes
CREATE TABLE IF NOT EXISTS public.docentes (
  dni             text        PRIMARY KEY CHECK (length(trim(dni)) >= 7),
  nombre_completo text        NOT NULL,
  area_principal  text,
  estado          text        NOT NULL DEFAULT 'activo'
                              CHECK (estado IN ('activo', 'inactivo')),
  ie_id           uuid        NOT NULL REFERENCES public.instituciones_educativas(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 1e. monitoreos
CREATE TABLE IF NOT EXISTS public.monitoreos (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_id            uuid        NOT NULL REFERENCES public.periodos_monitoreo(id) ON DELETE CASCADE,
  ie_id                 uuid        NOT NULL REFERENCES public.instituciones_educativas(id) ON DELETE CASCADE,
  fecha                 date        NOT NULL,
  dni_docente           text        NOT NULL,
  nombre_docente        text        NOT NULL,
  area                  text        NOT NULL,
  grado                 text        NOT NULL,
  seccion               text        NOT NULL,
  involucra_estudiantes integer     NOT NULL CHECK (involucra_estudiantes BETWEEN 1 AND 4),
  promueve_razonamiento integer     NOT NULL CHECK (promueve_razonamiento BETWEEN 1 AND 4),
  evalua_progreso       integer     NOT NULL CHECK (evalua_progreso BETWEEN 1 AND 4),
  propicia_ambiente     integer     NOT NULL CHECK (propicia_ambiente BETWEEN 1 AND 4),
  regula_comportamiento integer     NOT NULL CHECK (regula_comportamiento BETWEEN 1 AND 4),
  observaciones         text,
  registrado_por        uuid        REFERENCES public.perfiles(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_perfiles_auth_user_id   ON public.perfiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_perfiles_ie_id          ON public.perfiles(ie_id);
CREATE INDEX IF NOT EXISTS idx_periodos_ie_id          ON public.periodos_monitoreo(ie_id);
CREATE INDEX IF NOT EXISTS idx_monitoreos_ie_id        ON public.monitoreos(ie_id);
CREATE INDEX IF NOT EXISTS idx_monitoreos_periodo_id   ON public.monitoreos(periodo_id);
CREATE INDEX IF NOT EXISTS idx_monitoreos_dni_docente  ON public.monitoreos(dni_docente);
CREATE INDEX IF NOT EXISTS idx_docentes_ie_id          ON public.docentes(ie_id);

-- ============================================================
-- 3. GRANTS DE ACCESO A TABLAS
-- ============================================================
-- Necesario cuando "Automatically expose new tables" está desactivado.
-- service_role: acceso total (bypasa RLS, usado por el backend/service key)
-- authenticated: acceso controlado por RLS
-- anon: sin acceso directo a tablas (solo via RPC públicas)

GRANT ALL ON public.instituciones_educativas TO service_role;
GRANT ALL ON public.perfiles                 TO service_role;
GRANT ALL ON public.periodos_monitoreo       TO service_role;
GRANT ALL ON public.docentes                 TO service_role;
GRANT ALL ON public.monitoreos               TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.instituciones_educativas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfiles                 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.periodos_monitoreo       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.docentes                 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monitoreos               TO authenticated;
-- Buscan por auth_user_id, no por id.
-- plpgsql: no valida referencias en compilación.
CREATE OR REPLACE FUNCTION public.current_user_rol()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN (SELECT rol FROM public.perfiles WHERE auth_user_id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_ie_id()
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN (SELECT ie_id FROM public.perfiles WHERE auth_user_id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.current_perfil_id()
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN (SELECT id FROM public.perfiles WHERE auth_user_id = auth.uid());
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_user_rol()    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_ie_id()  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_perfil_id()   TO anon, authenticated;

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================
-- Limpiar policies existentes para idempotencia
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

ALTER TABLE public.instituciones_educativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periodos_monitoreo       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docentes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoreos               ENABLE ROW LEVEL SECURITY;

-- instituciones_educativas
CREATE POLICY "ie_select" ON public.instituciones_educativas FOR SELECT TO authenticated
  USING (estado = 'activo' OR current_user_rol() = 'super_admin');

CREATE POLICY "ie_all_superadmin" ON public.instituciones_educativas FOR ALL TO authenticated
  USING (current_user_rol() = 'super_admin')
  WITH CHECK (current_user_rol() = 'super_admin');

-- perfiles
-- CRÍTICO: la policy de SELECT no puede usar current_user_rol() para el propio perfil
-- porque crearía recursión (current_user_rol() lee perfiles, que está protegido por RLS).
-- Solución: permitir siempre leer el propio perfil por auth_user_id,
-- y usar current_user_rol() solo para leer perfiles ajenos.
CREATE POLICY "perfiles_select_own" ON public.perfiles FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "perfiles_select_same_ie" ON public.perfiles FOR SELECT TO authenticated
  USING (ie_id = current_user_ie_id());

CREATE POLICY "perfiles_select_superadmin" ON public.perfiles FOR SELECT TO authenticated
  USING (current_user_rol() = 'super_admin');

CREATE POLICY "perfiles_insert_superadmin" ON public.perfiles FOR INSERT TO authenticated
  WITH CHECK (current_user_rol() = 'super_admin');

CREATE POLICY "perfiles_insert_admin" ON public.perfiles FOR INSERT TO authenticated
  WITH CHECK (current_user_rol() = 'admin' AND ie_id = current_user_ie_id());

CREATE POLICY "perfiles_update_superadmin" ON public.perfiles FOR UPDATE TO authenticated
  USING (current_user_rol() = 'super_admin');

CREATE POLICY "perfiles_update_admin" ON public.perfiles FOR UPDATE TO authenticated
  USING (current_user_rol() = 'admin' AND ie_id = current_user_ie_id());

CREATE POLICY "perfiles_update_self" ON public.perfiles FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "perfiles_delete_superadmin" ON public.perfiles FOR DELETE TO authenticated
  USING (current_user_rol() = 'super_admin');

CREATE POLICY "perfiles_delete_admin" ON public.perfiles FOR DELETE TO authenticated
  USING (current_user_rol() = 'admin' AND ie_id = current_user_ie_id());

-- periodos_monitoreo
CREATE POLICY "periodos_select" ON public.periodos_monitoreo FOR SELECT TO authenticated
  USING (current_user_rol() = 'super_admin' OR ie_id = current_user_ie_id());

CREATE POLICY "periodos_write" ON public.periodos_monitoreo FOR ALL TO authenticated
  USING (ie_id = current_user_ie_id() AND current_user_rol() IN ('admin', 'director'))
  WITH CHECK (ie_id = current_user_ie_id() AND current_user_rol() IN ('admin', 'director'));

-- docentes
CREATE POLICY "docentes_select" ON public.docentes FOR SELECT TO authenticated
  USING (current_user_rol() = 'super_admin' OR ie_id = current_user_ie_id());

CREATE POLICY "docentes_write" ON public.docentes FOR ALL TO authenticated
  USING (ie_id = current_user_ie_id() AND current_user_rol() = 'admin')
  WITH CHECK (ie_id = current_user_ie_id() AND current_user_rol() = 'admin');

-- monitoreos
CREATE POLICY "monitoreos_select" ON public.monitoreos FOR SELECT TO authenticated
  USING (current_user_rol() = 'super_admin' OR ie_id = current_user_ie_id());

CREATE POLICY "monitoreos_insert" ON public.monitoreos FOR INSERT TO authenticated
  WITH CHECK (ie_id = current_user_ie_id() AND registrado_por = current_perfil_id());

CREATE POLICY "monitoreos_update" ON public.monitoreos FOR UPDATE TO authenticated
  USING (ie_id = current_user_ie_id() AND registrado_por = current_perfil_id());

CREATE POLICY "monitoreos_delete" ON public.monitoreos FOR DELETE TO authenticated
  USING (ie_id = current_user_ie_id()
    AND (registrado_por = current_perfil_id() OR current_user_rol() IN ('admin', 'super_admin')));

-- ============================================================
-- 5. FUNCIONES RPC
-- ============================================================

-- 5a. db_is_empty — detecta si no hay super_admin (primer arranque)
CREATE OR REPLACE FUNCTION public.db_is_empty()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN NOT EXISTS (SELECT 1 FROM public.perfiles WHERE rol = 'super_admin' LIMIT 1);
END;
$$;
GRANT EXECUTE ON FUNCTION public.db_is_empty() TO anon, authenticated;

-- 5b. register_first_admin — crea el super_admin inicial
CREATE OR REPLACE FUNCTION public.register_first_admin(p_nombre text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.perfiles WHERE rol = 'super_admin' LIMIT 1) THEN
    RETURN json_build_object('success', false, 'error', 'Ya existe un super_admin registrado.');
  END IF;
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No autenticado.');
  END IF;

  INSERT INTO public.perfiles (auth_user_id, rol, nombre, ie_id, debe_cambiar_pass)
  VALUES (auth.uid(), 'super_admin', p_nombre, NULL, false)
  ON CONFLICT (auth_user_id) DO UPDATE SET
    rol               = 'super_admin',
    nombre            = EXCLUDED.nombre,
    ie_id             = NULL,
    debe_cambiar_pass = false;

  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
GRANT EXECUTE ON FUNCTION public.register_first_admin(text) TO anon, authenticated;

-- 5c. skip_password_change
CREATE OR REPLACE FUNCTION public.skip_password_change()
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.perfiles SET debe_cambiar_pass = false WHERE auth_user_id = auth.uid();
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Perfil no encontrado.');
  END IF;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
REVOKE ALL ON FUNCTION public.skip_password_change() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.skip_password_change() TO authenticated;

-- 5d. reset_password_to_dni
CREATE OR REPLACE FUNCTION public.reset_password_to_dni(p_perfil_id uuid, p_dni text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions AS $$
DECLARE
  v_caller_rol  text;
  v_target_auth uuid;
  v_padded_dni  text;
BEGIN
  SELECT rol INTO v_caller_rol FROM public.perfiles WHERE auth_user_id = auth.uid();
  IF v_caller_rol NOT IN ('admin', 'super_admin') THEN
    RETURN json_build_object('success', false, 'error', 'No autorizado.');
  END IF;

  IF v_caller_rol = 'admin' AND NOT EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = p_perfil_id AND ie_id = public.current_user_ie_id()
  ) THEN
    RETURN json_build_object('success', false, 'error', 'No autorizado: diferente IE.');
  END IF;

  SELECT auth_user_id INTO v_target_auth FROM public.perfiles WHERE id = p_perfil_id;
  IF v_target_auth IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuario sin cuenta auth.');
  END IF;

  v_padded_dni := lpad(trim(p_dni), 8, '0');

  UPDATE auth.users SET
    encrypted_password = extensions.crypt(v_padded_dni, extensions.gen_salt('bf')),
    updated_at = now()
  WHERE id = v_target_auth;

  UPDATE public.perfiles SET debe_cambiar_pass = true WHERE id = p_perfil_id;

  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
REVOKE ALL ON FUNCTION public.reset_password_to_dni(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_password_to_dni(uuid, text) TO authenticated;

-- 5e. crear_usuario_con_dni
CREATE OR REPLACE FUNCTION public.crear_usuario_con_dni(
  p_email   text,
  p_nombre  text,
  p_dni     text,
  p_rol     text,
  p_ie_id   uuid DEFAULT NULL
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions AS $$
DECLARE
  v_caller_rol text;
  v_caller_ie  uuid;
  v_target_ie  uuid;
  v_auth_id    uuid;
  v_perfil_id  uuid;
  v_padded_dni text;
BEGIN
  SELECT rol, ie_id INTO v_caller_rol, v_caller_ie
  FROM public.perfiles WHERE auth_user_id = auth.uid();

  IF v_caller_rol NOT IN ('admin', 'super_admin') THEN
    RETURN json_build_object('success', false, 'error', 'No autorizado.');
  END IF;
  IF p_rol NOT IN ('admin', 'director', 'subdirector', 'coordinador') THEN
    RETURN json_build_object('success', false, 'error', 'Rol inválido: ' || p_rol);
  END IF;

  v_target_ie  := CASE WHEN v_caller_rol = 'super_admin' THEN p_ie_id ELSE v_caller_ie END;
  v_padded_dni := lpad(trim(p_dni), 8, '0');

  -- ¿Ya existe el email en auth?
  SELECT id INTO v_auth_id FROM auth.users WHERE email = lower(trim(p_email));

  IF v_auth_id IS NOT NULL THEN
    -- Actualizar o crear perfil vinculado a ese auth_user_id
    INSERT INTO public.perfiles (auth_user_id, rol, nombre, dni, ie_id, debe_cambiar_pass)
    VALUES (v_auth_id, p_rol, p_nombre, v_padded_dni, v_target_ie, true)
    ON CONFLICT (auth_user_id) DO UPDATE SET
      rol = EXCLUDED.rol, nombre = EXCLUDED.nombre,
      dni = EXCLUDED.dni, ie_id = EXCLUDED.ie_id,
      debe_cambiar_pass = true
    RETURNING id INTO v_perfil_id;

    RETURN json_build_object('success', true, 'perfil_id', v_perfil_id, 'created', false);
  END IF;

  -- Crear usuario nuevo en auth
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    lower(trim(p_email)),
    extensions.crypt(v_padded_dni, extensions.gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('nombre', p_nombre)
  ) RETURNING id INTO v_auth_id;

  -- Crear identidad (OBLIGATORIO para evitar "Database error querying schema")
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_auth_id, 
    jsonb_build_object('sub', v_auth_id, 'email', lower(trim(p_email))),
    'email', lower(trim(p_email)), now(), now(), now()
  );

  -- Crear perfil vinculado
  INSERT INTO public.perfiles (auth_user_id, rol, nombre, dni, ie_id, debe_cambiar_pass)
  VALUES (v_auth_id, p_rol, p_nombre, v_padded_dni, v_target_ie, true)
  RETURNING id INTO v_perfil_id;

  RETURN json_build_object('success', true, 'perfil_id', v_perfil_id, 'created', true,
    'message', 'Contraseña inicial: DNI ' || v_padded_dni);

EXCEPTION WHEN unique_violation THEN
  RETURN json_build_object('success', false, 'error', 'El email ya está registrado.');
WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
REVOKE ALL ON FUNCTION public.crear_usuario_con_dni(text, text, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.crear_usuario_con_dni(text, text, text, text, uuid) TO authenticated;

-- 5f. crear_ie_con_admin
CREATE OR REPLACE FUNCTION public.crear_ie_con_admin(
  p_nombre        text,
  p_admin_email   text,
  p_admin_nombre  text,
  p_admin_dni     text,
  p_codigo_minedu text DEFAULT NULL,
  p_direccion     text DEFAULT NULL,
  p_ugel          text DEFAULT NULL
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions AS $$
DECLARE
  v_ie_id      uuid;
  v_auth_id    uuid;
  v_perfil_id  uuid;
  v_padded_dni text;
BEGIN
  IF public.current_user_rol() != 'super_admin' THEN
    RETURN json_build_object('success', false, 'error', 'Solo super_admin puede crear IEs.');
  END IF;

  v_padded_dni := lpad(trim(p_admin_dni), 8, '0');

  INSERT INTO public.instituciones_educativas (nombre, codigo_minedu, direccion, ugel)
  VALUES (p_nombre, p_codigo_minedu, p_direccion, p_ugel)
  RETURNING id INTO v_ie_id;

  -- ¿Ya existe el email en auth?
  SELECT id INTO v_auth_id FROM auth.users WHERE email = lower(trim(p_admin_email));

  IF v_auth_id IS NOT NULL THEN
    INSERT INTO public.perfiles (auth_user_id, rol, nombre, dni, ie_id, debe_cambiar_pass)
    VALUES (v_auth_id, 'admin', p_admin_nombre, v_padded_dni, v_ie_id, true)
    ON CONFLICT (auth_user_id) DO UPDATE SET
      rol = 'admin', nombre = EXCLUDED.nombre,
      dni = EXCLUDED.dni, ie_id = EXCLUDED.ie_id,
      debe_cambiar_pass = true
    RETURNING id INTO v_perfil_id;
  ELSE
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(), 'authenticated', 'authenticated',
      lower(trim(p_admin_email)),
      extensions.crypt(v_padded_dni, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('nombre', p_admin_nombre)
    ) RETURNING id INTO v_auth_id;

    -- Crear identidad (OBLIGATORIO para evitar "Database error querying schema")
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_auth_id, 
      jsonb_build_object('sub', v_auth_id, 'email', lower(trim(p_admin_email))),
      'email', lower(trim(p_admin_email)), now(), now(), now()
    );

    INSERT INTO public.perfiles (auth_user_id, rol, nombre, dni, ie_id, debe_cambiar_pass)
    VALUES (v_auth_id, 'admin', p_admin_nombre, v_padded_dni, v_ie_id, true)
    RETURNING id INTO v_perfil_id;
  END IF;

  RETURN json_build_object('success', true, 'ie_id', v_ie_id, 'perfil_id', v_perfil_id,
    'message', 'IE creada. Contraseña inicial del admin: DNI ' || v_padded_dni);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
REVOKE ALL ON FUNCTION public.crear_ie_con_admin(text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.crear_ie_con_admin(text, text, text, text, text, text, text) TO authenticated;

-- 5g. eliminar_usuario — elimina perfil y cuenta auth
CREATE OR REPLACE FUNCTION public.eliminar_usuario(p_perfil_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_caller_rol text;
  v_caller_ie  uuid;
  v_target_rol text;
  v_target_ie  uuid;
  v_auth_id    uuid;
BEGIN
  SELECT rol, ie_id INTO v_caller_rol, v_caller_ie
  FROM public.perfiles WHERE auth_user_id = auth.uid();

  IF v_caller_rol NOT IN ('admin', 'super_admin') THEN
    RETURN json_build_object('success', false, 'error', 'No autorizado.');
  END IF;
  IF p_perfil_id = public.current_perfil_id() THEN
    RETURN json_build_object('success', false, 'error', 'No puedes eliminar tu propia cuenta.');
  END IF;

  SELECT rol, ie_id, auth_user_id INTO v_target_rol, v_target_ie, v_auth_id
  FROM public.perfiles WHERE id = p_perfil_id;

  IF v_target_rol = 'super_admin' THEN
    RETURN json_build_object('success', false, 'error', 'No se puede eliminar un super_admin.');
  END IF;
  IF v_caller_rol = 'admin' AND v_target_ie IS DISTINCT FROM v_caller_ie THEN
    RETURN json_build_object('success', false, 'error', 'El usuario pertenece a otra IE.');
  END IF;

  -- Eliminar perfil primero (monitoreos.registrado_por → SET NULL automático)
  DELETE FROM public.perfiles WHERE id = p_perfil_id;

  -- Eliminar cuenta auth si existe (sin FK que bloquee — ya no hay CASCADE)
  IF v_auth_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = v_auth_id;
  END IF;

  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
REVOKE ALL ON FUNCTION public.eliminar_usuario(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.eliminar_usuario(uuid) TO authenticated;

-- ============================================================
-- FIN
-- ============================================================
-- Sin triggers en auth.users. Sin acoplamiento con GoTrue.
-- Pasos post-ejecución:
-- 1. Ir a /setup para crear el primer super_admin
-- 2. Desde el dashboard del super_admin crear las IEs
-- ============================================================
