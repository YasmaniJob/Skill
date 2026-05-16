export const INDICADORES = [
  {
    id: "involucra_estudiantes",
    nombre: "Involucra activamente a los estudiantes en el proceso de aprendizaje",
    abrev: "IE",
  },
  {
    id: "promueve_razonamiento",
    nombre: "Promueve el razonamiento, la creatividad y/o el pensamiento crítico",
    abrev: "PR",
  },
  {
    id: "evalua_progreso",
    nombre: "Evalúa el progreso de los aprendizajes para retroalimentar a los estudiantes y adecuar su enseñanza",
    abrev: "EP",
  },
  {
    id: "propicia_ambiente",
    nombre: "Propicia un ambiente de respeto y proximidad",
    abrev: "PA",
  },
  {
    id: "regula_comportamiento",
    nombre: "Regula positivamente el comportamiento de los estudiantes",
    abrev: "RC",
  },
];

// Escala 1-4. Fuente única de estilos para todos los componentes.
export const NIVELES = {
  1: {
    etiqueta: "Muy deficiente",
    colorHex: "#ef4444",
    // Fondo suave (badges, gráficos)
    badge: "bg-red-100 text-red-700",
    // Fondo sólido (botones activos en formulario)
    active: "bg-rose-600 text-white border-rose-600",
    // Fondo sólido compacto (celdas de tabla)
    solid: "bg-rose-600 text-white border-rose-700",
    // Clases individuales para usos específicos
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
  },
  2: {
    etiqueta: "En proceso",
    colorHex: "#f97316",
    badge: "bg-orange-100 text-orange-700",
    active: "bg-amber-500 text-white border-amber-500",
    solid: "bg-amber-500 text-white border-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  3: {
    etiqueta: "Suficiente",
    colorHex: "#3b82f6",
    badge: "bg-blue-100 text-blue-700",
    active: "bg-blue-600 text-white border-blue-600",
    solid: "bg-blue-600 text-white border-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
  4: {
    etiqueta: "Destacado",
    colorHex: "#22c55e",
    badge: "bg-green-100 text-green-700",
    active: "bg-emerald-600 text-white border-emerald-600",
    solid: "bg-emerald-600 text-white border-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
};
