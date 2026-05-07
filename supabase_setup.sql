-- ============================================================
-- Skill — Schema completo con roles y periodos de monitoreo
-- ============================================================

-- 1. Tabla de perfiles (roles por usuario)
CREATE TABLE perfiles (
  id          uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  rol         text NOT NULL CHECK (rol IN ('admin', 'director', 'subdirector', 'coordinador')),
  nombre      text,
  debe_cambiar_pass boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden ver los perfiles (evita recursión)
CREATE POLICY "Ver perfiles"
  ON perfiles FOR SELECT
  TO authenticated USING (true);

-- Separamos las operaciones para evitar que el FOR ALL cause recursión en el SELECT
CREATE POLICY "Admin inserta perfiles"
  ON perfiles FOR INSERT
  TO authenticated WITH CHECK (
    (SELECT rol FROM perfiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admin actualiza perfiles"
  ON perfiles FOR UPDATE
  TO authenticated USING (
    (SELECT rol FROM perfiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admin elimina perfiles"
  ON perfiles FOR DELETE
  TO authenticated USING (
    (SELECT rol FROM perfiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================

-- 2. Tabla de periodos de monitoreo
-- Equivalente a cada "archivo Excel" por visita/período
CREATE TABLE periodos_monitoreo (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre          text NOT NULL,           -- Ej: "Visita 1 - 2026"
  anio            integer NOT NULL,        -- 2026
  numero_visita   integer NOT NULL CHECK (numero_visita BETWEEN 1 AND 5),
  fecha_inicio    date,
  fecha_fin       date,
  estado          text DEFAULT 'activo' CHECK (estado IN ('activo', 'cerrado')),
  creado_por      uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE periodos_monitoreo ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden leer periodos
CREATE POLICY "Leer periodos"
  ON periodos_monitoreo FOR SELECT
  TO authenticated USING (true);

-- Solo admin y director pueden crear/editar periodos
CREATE POLICY "Admin y Director gestionan periodos"
  ON periodos_monitoreo FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('admin', 'director'))
  );

-- ============================================================

-- 3. Tabla de monitoreos (registros individuales por docente)
CREATE TABLE monitoreos (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  periodo_id            uuid NOT NULL REFERENCES periodos_monitoreo(id) ON DELETE CASCADE,
  fecha                 date NOT NULL,
  dni_docente           text NOT NULL,
  nombre_docente        text NOT NULL,
  area                  text NOT NULL,
  grado                 text NOT NULL,
  seccion               text NOT NULL,
  involucra_estudiantes integer NOT NULL CHECK (involucra_estudiantes BETWEEN 1 AND 4),
  promueve_razonamiento integer NOT NULL CHECK (promueve_razonamiento BETWEEN 1 AND 4),
  evalua_progreso       integer NOT NULL CHECK (evalua_progreso BETWEEN 1 AND 4),
  propicia_ambiente     integer NOT NULL CHECK (propicia_ambiente BETWEEN 1 AND 4),
  regula_comportamiento integer NOT NULL CHECK (regula_comportamiento BETWEEN 1 AND 4),
  observaciones         text,
  registrado_por        uuid REFERENCES auth.users(id),
  created_at            timestamptz DEFAULT now()
);

ALTER TABLE monitoreos ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden leer monitoreos
CREATE POLICY "Leer monitoreos"
  ON monitoreos FOR SELECT
  TO authenticated USING (true);

-- Usuarios autenticados pueden insertar
CREATE POLICY "Insertar monitoreos"
  ON monitoreos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = registrado_por);

-- Solo el creador puede editar sus propios registros
CREATE POLICY "Editar propio monitoreo"
  ON monitoreos FOR UPDATE
  TO authenticated USING (auth.uid() = registrado_por);

-- Solo el creador puede eliminar sus registros (admin puede eliminar cualquiera)
CREATE POLICY "Eliminar monitoreo"
  ON monitoreos FOR DELETE
  TO authenticated USING (
    auth.uid() = registrado_por
    OR EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- ============================================================
-- INSTRUCCIONES:
-- 1. Ejecutar este SQL en el SQL Editor de Supabase
-- 2. Crear el primer usuario desde Supabase Auth > Users > Add user
-- 3. Insertar su perfil con rol 'admin':
--    INSERT INTO perfiles (id, rol, nombre) VALUES ('<uuid-del-usuario>', 'admin', 'Administrador');
-- ============================================================

-- ============================================================
-- 4. Tabla de Docentes (Padrón de profesores)
-- ============================================================
CREATE TABLE docentes (
  dni             text PRIMARY KEY CHECK (length(dni) >= 8),
  nombre_completo text NOT NULL,
  area_principal  text,
  estado          text DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE docentes ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden ver la lista de docentes (para el buscador)
CREATE POLICY "Ver docentes"
  ON docentes FOR SELECT
  TO authenticated USING (true);

-- Solo administradores pueden gestionar el padrón de docentes
CREATE POLICY "Admin inserta docentes"
  ON docentes FOR INSERT
  TO authenticated WITH CHECK ( (SELECT rol FROM perfiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Admin actualiza docentes"
  ON docentes FOR UPDATE
  TO authenticated USING ( (SELECT rol FROM perfiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Admin elimina docentes"
  ON docentes FOR DELETE
  TO authenticated USING ( (SELECT rol FROM perfiles WHERE id = auth.uid()) = 'admin' );
