import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FileDown } from 'lucide-react';

const ExportarPDF = ({ monitoreos }) => {
  const handleExport = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Skill — Reporte de Gestión Pedagógica 2026', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 28);

    const tableColumn = ["Fecha", "Docente", "DNI", "Área", "Grado", "Sec", "I1", "I2", "I3", "I4", "I5", "Prom"];
    const tableRows = [];

    monitoreos.forEach(m => {
      const rowData = [
        new Date(m.fecha).toLocaleDateString(),
        m.nombre_docente,
        m.dni_docente,
        m.area,
        m.grado,
        m.seccion,
        m.involucra_estudiantes,
        m.promueve_razonamiento,
        m.evalua_progreso,
        m.propicia_ambiente,
        m.regula_comportamiento,
        ((m.involucra_estudiantes + m.promueve_razonamiento + m.evalua_progreso + m.propicia_ambiente + m.regula_comportamiento) / 5).toFixed(1)
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233], fontSize: 9 }, // primary-500
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
    }

    doc.save(`Reporte_Skill_${new Date().getTime()}.pdf`);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95"
    >
      <FileDown className="w-5 h-5" />
      Exportar a PDF
    </button>
  );
};

export default ExportarPDF;
