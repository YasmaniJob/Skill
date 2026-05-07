import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileDown, Loader2 } from 'lucide-react';
import DocumentoReporte from './DocumentoReporte';

const ExportarPDF = ({ monitoreos }) => {
  return (
    <PDFDownloadLink
      document={<DocumentoReporte monitoreos={monitoreos} />}
      fileName={`Reporte_MonitorED_${new Date().getTime()}.pdf`}
      className="w-full"
    >
      {({ blob, url, loading, error }) => (
        <button
          disabled={loading}
          className="w-full group relative bg-white border border-slate-200 p-8 rounded-xl hover:border-rose-500 transition-all cursor-pointer flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileDown className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Reporte Técnico</h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase">
              {loading ? 'Generando documento...' : 'Formato PDF (.pdf)'}
            </p>
          </div>
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default ExportarPDF;
