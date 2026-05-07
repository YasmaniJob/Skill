// Generado automáticamente desde MONITOREO DOCENTE 2026.xlsm
// Hoja BD_Monitoreo → columnas 7-11 (nombres exactos de los indicadores)
// Hoja Procesamiento → niveles de desempeño (DESTACADO, SUFICIENTE, EN PROCESO, MUY DEFICIENTE)

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

// Escala 1-4 extraída de hoja Procesamiento
export const NIVELES = {
  1: {
    etiqueta: "Muy deficiente",
    color: "bg-red-500",
    colorHex: "#ef4444",
    text: "text-red-700",
    border: "border-red-500",
    badge: "bg-red-100 text-red-700",
  },
  2: {
    etiqueta: "En proceso",
    color: "bg-orange-500",
    colorHex: "#f97316",
    text: "text-orange-700",
    border: "border-orange-500",
    badge: "bg-orange-100 text-orange-700",
  },
  3: {
    etiqueta: "Suficiente",
    color: "bg-blue-500",
    colorHex: "#3b82f6",
    text: "text-blue-700",
    border: "border-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
  4: {
    etiqueta: "Destacado",
    color: "bg-green-500",
    colorHex: "#22c55e",
    text: "text-green-700",
    border: "border-green-500",
    badge: "bg-green-100 text-green-700",
  },
};
