-- =====================================================
-- SKILL — Supabase Schema v1.2 (Idempotente / Seguro)
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Extensión requerida para encriptar contraseñas (crypt / gen_salt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- 1. INSTITUCIONES
create table if not exists public.instituciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  codigo_minedu text,
  direccion text,
  ugel text,
  estado text default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamptz default now()
);
alter table public.instituciones enable row level security;

-- 2. PROFILES (extiende auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nombre text,
  dni text,
  rol text check (rol in ('super_admin','admin','director','subdirector','coordinador')),
  ie_id uuid references public.instituciones(id) on delete set null,
  debe_cambiar_pass boolean default false,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- Trigger: crear perfil vacío al registrar usuario en auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Re-crear trigger de forma segura
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. PERIODOS
create table if not exists public.periodos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  numero_visita integer,
  anio integer,
  estado text default 'activo' check (estado in ('activo','cerrado')),
  fecha_inicio date,
  fecha_fin date,
  ie_id uuid references public.instituciones(id) on delete cascade,
  registrado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.periodos enable row level security;

-- 4. DOCENTES
create table if not exists public.docentes (
  id uuid primary key default gen_random_uuid(),
  dni text not null,
  nombre_completo text not null,
  area_principal text,
  ie_id uuid references public.instituciones(id) on delete cascade,
  created_at timestamptz default now(),
  unique(dni, ie_id)
);
alter table public.docentes enable row level security;

-- 5. MONITOREOS (scores aplanados)
create table if not exists public.monitoreos (
  id uuid primary key default gen_random_uuid(),
  docente_id uuid references public.docentes(id) on delete set null,
  periodo_id uuid references public.periodos(id) on delete set null,
  area text,
  grado text,
  seccion text,
  fecha date,
  involucra_estudiantes numeric(3,1),
  promueve_razonamiento numeric(3,1),
  evalua_progreso numeric(3,1),
  propicia_ambiente numeric(3,1),
  regula_comportamiento numeric(3,1),
  observaciones text,
  registrado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.monitoreos enable row level security;

-- =====================================================
-- FUNCIONES HELPER (SECURITY DEFINER)
-- =====================================================
create or replace function public.get_my_role()
returns text language sql security definer stable as $$
  select rol from public.profiles where id = auth.uid();
$$;

create or replace function public.get_my_ie_id()
returns uuid language sql security definer stable as $$
  select ie_id from public.profiles where id = auth.uid();
$$;

-- =====================================================
-- RPC: CREAR USUARIO INSTITUCIONAL (sin exponer service role)
-- =====================================================
create or replace function public.create_institutional_user(
  p_email text, p_password text, p_nombre text,
  p_dni text, p_rol text, p_ie_id uuid
) returns uuid language plpgsql security definer set search_path = extensions, public as $$
declare
  new_id uuid;
begin
  if get_my_role() not in ('admin','super_admin') then
    raise exception 'No autorizado';
  end if;

  new_id := gen_random_uuid();

  -- Crear usuario directamente en auth.users
  insert into auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    new_id, 'authenticated', 'authenticated',
    p_email, crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('nombre', p_nombre),
    now(), now()
  );

  -- CRÍTICO: registrar identidad de email para que signInWithPassword funcione para este usuario
  insert into auth.identities (
    id, user_id, provider_id, identity_data,
    provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), new_id, p_email,
    jsonb_build_object('sub', new_id::text, 'email', p_email),
    'email', now(), now(), now()
  );

  -- Actualizar perfil correspondiente
  update public.profiles
  set nombre = p_nombre, dni = p_dni, rol = p_rol,
      ie_id = p_ie_id, debe_cambiar_pass = true
  where id = new_id;

  return new_id;
end;
$$;

-- =====================================================
-- RPC: ELIMINAR USUARIO INSTITUCIONAL
-- =====================================================
create or replace function public.admin_delete_user(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if get_my_role() not in ('admin','super_admin') then
    raise exception 'No autorizado';
  end if;
  if get_my_role() = 'admin' and (select ie_id from public.profiles where id = p_user_id) != get_my_ie_id() then
    raise exception 'No puedes eliminar un usuario de otra IE';
  end if;

  delete from auth.users where id = p_user_id;
end;
$$;

-- =====================================================
-- RPC: RESETEAR CONTRASEÑA A DNI
-- =====================================================
create or replace function public.admin_reset_user_password(p_user_id uuid, p_new_password text)
returns void language plpgsql security definer set search_path = extensions, public as $$
begin
  if get_my_role() not in ('admin','super_admin') then
    raise exception 'No autorizado';
  end if;
  if get_my_role() = 'admin' and (select ie_id from public.profiles where id = p_user_id) != get_my_ie_id() then
    raise exception 'No puedes resetear la contraseña de un usuario de otra IE';
  end if;

  update auth.users
  set encrypted_password = crypt(p_new_password, gen_salt('bf'))
  where id = p_user_id;

  update public.profiles
  set debe_cambiar_pass = true
  where id = p_user_id;
end;
$$;

-- =====================================================
-- RPC: VERIFICAR SI EL PRIMER REGISTRO ESTÁ COMPLETO
-- =====================================================
create or replace function public.is_setup_complete()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  return exists (select 1 from public.profiles where rol = 'super_admin');
end;
$$;

-- =====================================================
-- RPC: PRIMER REGISTRO DEL SUPER ADMIN (sin sesión)
-- Crea el usuario directamente en auth.users + auth.identities
-- y lo configura como super_admin. Solo funciona si NO hay
-- ningún super_admin registrado todavía.
-- =====================================================
create or replace function public.bootstrap_super_admin(
  p_email text,
  p_password text,
  p_nombre text
) returns void language plpgsql security definer set search_path = extensions, public as $$
declare
  new_id uuid;
begin
  -- Protección: solo si aún no hay super_admin
  if exists (select 1 from public.profiles where rol = 'super_admin') then
    raise exception 'Ya existe un super administrador registrado.';
  end if;

  new_id := gen_random_uuid();

  -- Crear usuario directamente en auth.users
  insert into auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    new_id, 'authenticated', 'authenticated',
    p_email, crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('nombre', p_nombre),
    now(), now()
  );

  -- CRÍTICO: registrar identidad de email para que signInWithPassword funcione
  insert into auth.identities (
    id, user_id, provider_id, identity_data,
    provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), new_id, p_email,
    jsonb_build_object('sub', new_id::text, 'email', p_email),
    'email', now(), now(), now()
  );

  -- Actualizar el perfil que creó el trigger con el rol super_admin
  update public.profiles
  set
    nombre            = p_nombre,
    rol               = 'super_admin',
    debe_cambiar_pass = false
  where id = new_id;
end;
$$;


-- =====================================================
-- RLS POLICIES (DROP & CREATE para seguridad idempotente)
-- =====================================================

-- INSTITUCIONES
drop policy if exists "Autenticados pueden leer IEs" on public.instituciones;
create policy "Autenticados pueden leer IEs" on public.instituciones
  for select using (auth.uid() is not null);

drop policy if exists "Super admin gestiona IEs" on public.instituciones;
create policy "Super admin gestiona IEs" on public.instituciones
  for all using (get_my_role() = 'super_admin');

-- PROFILES
drop policy if exists "Propio perfil" on public.profiles;
create policy "Propio perfil" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "Admin lee perfiles de su IE" on public.profiles;
create policy "Admin lee perfiles de su IE" on public.profiles
  for select using (ie_id = get_my_ie_id() and get_my_role() in ('admin','director'));

drop policy if exists "Super admin lee todos" on public.profiles;
create policy "Super admin lee todos" on public.profiles
  for select using (get_my_role() = 'super_admin');

drop policy if exists "Usuario edita su perfil" on public.profiles;
create policy "Usuario edita su perfil" on public.profiles
  for update using (id = auth.uid());

drop policy if exists "Admin gestiona perfiles de su IE" on public.profiles;
create policy "Admin gestiona perfiles de su IE" on public.profiles
  for all using (ie_id = get_my_ie_id() and get_my_role() in ('admin'));

drop policy if exists "Super admin gestiona todos los perfiles" on public.profiles;
create policy "Super admin gestiona todos los perfiles" on public.profiles
  for all using (get_my_role() = 'super_admin');

-- PERIODOS
drop policy if exists "IE members leen periodos" on public.periodos;
create policy "IE members leen periodos" on public.periodos
  for select using (ie_id = get_my_ie_id() or get_my_role() = 'super_admin');

drop policy if exists "IE members gestionan periodos" on public.periodos;
create policy "IE members gestionan periodos" on public.periodos
  for all using (ie_id = get_my_ie_id() or get_my_role() = 'super_admin');

-- DOCENTES
drop policy if exists "IE members leen docentes" on public.docentes;
create policy "IE members leen docentes" on public.docentes
  for select using (ie_id = get_my_ie_id() or get_my_role() = 'super_admin');

drop policy if exists "IE members gestionan docentes" on public.docentes;
create policy "IE members gestionan docentes" on public.docentes
  for all using (ie_id = get_my_ie_id() or get_my_role() = 'super_admin');

-- MONITOREOS
drop policy if exists "IE members leen monitoreos" on public.monitoreos;
create policy "IE members leen monitoreos" on public.monitoreos
  for select using (
    periodo_id in (select id from public.periodos where ie_id = get_my_ie_id())
    or get_my_role() = 'super_admin'
  );

drop policy if exists "IE members crean monitoreos" on public.monitoreos;
create policy "IE members crean monitoreos" on public.monitoreos
  for insert with check (
    periodo_id in (select id from public.periodos where ie_id = get_my_ie_id())
  );

drop policy if exists "IE members eliminan monitoreos" on public.monitoreos;
create policy "IE members eliminan monitoreos" on public.monitoreos
  for delete using (
    registrado_por = auth.uid() or get_my_role() in ('admin','super_admin')
  );
