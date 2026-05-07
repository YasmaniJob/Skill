import React from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet } from 'lucide-react';

const ExportarExcel = ({ monitoreos }) => {
  const handleExport = () => {
    const data = monitoreos.map(m => ({
      Fecha: m.fecha,
      Docente: m.nombre_docente,
      DNI: m.dni_docente,
      Area: m.area,
      Grado: m.grado,
      Seccion: m.seccion,
      I1: m.involucra_estudiantes,
      I2: m.promueve_razonamiento,
      I3: m.evalua_progreso,
      I4: m.propicia_ambiente,
      I5: m.regula_comportamiento,
      Promedio: ((m.involucra_estudiantes + m.promueve_razonamiento + m.evalua_progreso + m.propicia_ambiente + m.regula_comportamiento) / 5).toFixed(2)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monitoreos");
    XLSX.writeFile(wb, `Reporte_Skill_${new Date().getTime()}.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      className="w-full group relative bg-white border border-slate-200 p-8 rounded-xl hover:border-emerald-500 transition-all cursor-pointer flex flex-col items-center gap-4"
    >
      <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
        <FileSpreadsheet className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Matriz de Datos</h4>
        <p className="text-[9px] font-bold text-slate-400 uppercase">Formato Excel (.xlsx)</p>
      </div>
    </button>
  );
};

export default ExportarExcel;
