import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import { INDICADORES, NIVELES } from '../../data/indicadores';

const ExportarExcel = ({ monitoreos }) => {
  const handleExport = () => {
    // Hoja 1: Monitoreos
    const wsMonitoreos = XLSX.utils.json_to_sheet(monitoreos.map(m => ({
      Fecha: m.fecha,
      DNI: m.dni_docente,
      Docente: m.nombre_docente,
      Área: m.area,
      Grado: m.grado,
      Sección: m.seccion,
      I1: m.involucra_estudiantes,
      I2: m.promueve_razonamiento,
      I3: m.evalua_progreso,
      I4: m.propicia_ambiente,
      I5: m.regula_comportamiento,
      Promedio: ((m.involucra_estudiantes + m.promueve_razonamiento + m.evalua_progreso + m.propicia_ambiente + m.regula_comportamiento) / 5).toFixed(2),
      'Registrado por': m.registrado_por
    })));

    // Hoja 2: Resumen
    const resumenData = INDICADORES.map(ind => {
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
      monitoreos.forEach(m => {
        counts[m[ind.id]]++;
      });
      return {
        Indicador: ind.nombre,
        [NIVELES[1].etiqueta]: counts[1],
        [NIVELES[2].etiqueta]: counts[2],
        [NIVELES[3].etiqueta]: counts[3],
        [NIVELES[4].etiqueta]: counts[4],
        Total: monitoreos.length
      };
    });
    const wsResumen = XLSX.utils.json_to_sheet(resumenData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsMonitoreos, "Monitoreos");
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

    XLSX.writeFile(wb, `Reporte_Monitoreo_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95"
    >
      <Download className="w-5 h-5" />
      Exportar a Excel
    </button>
  );
};

export default ExportarExcel;
