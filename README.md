# MonitorED - Monitoreo Pedagógico Docente 2026

Aplicación web para el seguimiento y monitoreo del desempeño docente en instituciones educativas del Perú.

## Tecnologías
- **Frontend**: React + Vite + TailwindCSS
- **Backend/DB**: Supabase (Auth + PostgreSQL)
- **Gráficos**: Recharts
- **Exportación**: jsPDF + SheetJS

## Instrucciones de Configuración

### 1. Base de Datos (Supabase)
1. Crea un nuevo proyecto en [Supabase](https://supabase.com).
2. Ve al **SQL Editor** y ejecuta el contenido del archivo `supabase_setup.sql`. Esto creará la tabla `monitoreos` y configurará las políticas de seguridad (RLS).
3. En la sección **Authentication**, asegúrate de que el registro de usuarios esté habilitado o crea un usuario manualmente para las pruebas.

### 2. Variables de Entorno
1. Renombra el archivo `.env.example` a `.env`.
2. Completa los valores `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los datos que encontrarás en **Project Settings > API** de tu proyecto Supabase.

### 3. Instalación y Ejecución
```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm run dev
```

## Estructura de Datos
Los indicadores utilizados corresponden a las **Rúbricas de Desempeño Docente** oficiales del Perú:
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
Desarrollado con enfoque en alta densidad de información y diseño premium.
