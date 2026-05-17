# Skill - Gestión Pedagógica y Monitoreo 2026

Aplicación web para el seguimiento y monitoreo del desempeño docente en instituciones educativas del Perú.

## Tecnologías
- **Frontend**: React + Vite + TailwindCSS
- **Backend/DB**: Supabase (Auth + PostgreSQL)
- **Gráficos**: Recharts
- **Exportación**: jsPDF + SheetJS

## Instrucciones de Configuración

### 1. Base de Datos (Supabase)
1. Crea un proyecto gratuito en [Supabase](https://supabase.com) (servidor en São Paulo recomendado).
2. Ve al **SQL Editor** y ejecuta el contenido del archivo `supabase/schema.sql` para crear las tablas, funciones RPC y políticas RLS.
3. El primer arranque de la aplicación redirigirá automáticamente a `/setup` para crear la cuenta **Super Admin**.

### 2. Variables de Entorno
1. Copia `.env.example` a `.env`.
2. Completa las variables con los valores de tu proyecto Supabase (Settings → API):

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Instalación y Ejecución
```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm run dev
```

## Estructura de Datos
Los indicadores corresponden a las **Rúbricas de Desempeño Docente** oficiales del Perú:
1. Involucra activamente a los estudiantes.
2. Promueve el razonamiento y pensamiento crítico.
3. Evalúa el progreso y retroalimenta.
4. Propicia un ambiente de respeto.
5. Regula positivamente el comportamiento.

### Escala de Valoración
- **1**: Muy deficiente (Rojo)
- **2**: En proceso (Naranja)
- **3**: Suficiente (Azul)
- **4**: Destacado (Verde)

---

## Contexto Técnico para Desarrolladores / AI Agents

1. **Backend: Supabase (PostgreSQL)**. El proyecto usa `@supabase/supabase-js` v2. No hay ninguna dependencia de PocketBase.
2. **Autenticación**: Manejada por `supabase.auth`. Los perfiles de usuario están en la tabla `profiles` (vinculada a `auth.users` por `id`).
3. **Roles**: `super_admin`, `admin`, `director`, `subdirector`. Definidos en `profiles.rol`.
4. **Funciones RPC**: `create_institutional_user`, `admin_delete_user`, `admin_reset_user_password`, `is_setup_complete` — ejecutadas con `supabase.rpc(...)`.
5. **RLS**: Todas las tablas tienen Row Level Security activo. Las políticas se definen en el schema SQL.

---
Desarrollado con enfoque en alta densidad de información y diseño premium.
