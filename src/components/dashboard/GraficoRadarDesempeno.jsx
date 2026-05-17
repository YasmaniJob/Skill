import React from 'react';
import { clsx } from 'clsx';

const GraficoRadarDesempeno = ({ data }) => {
  // data is an array of 5 items: { subject: 'IE', nombre: '...', A: 85 }
  
  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">Huella Pedagógica</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Porcentaje de logro institucional por indicador (Nivel 3+)</p>
      </div>

      <div className="flex-1 space-y-6 pr-1">
        {data.map((item, index) => {
          const val = item.A;
          
          // Determinamos colores y clases según el porcentaje de logro
          let badgeClass = "bg-rose-50 text-rose-700 border-rose-100";
          let barClass = "from-rose-400 to-red-500 shadow-rose-200/50";
          
          if (val >= 75) {
            badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
            barClass = "from-emerald-400 to-teal-500 shadow-emerald-200/50";
          } else if (val >= 50) {
            badgeClass = "bg-blue-50 text-blue-700 border-blue-100";
            barClass = "from-blue-400 to-indigo-500 shadow-blue-200/50";
          } else if (val >= 25) {
            badgeClass = "bg-amber-50 text-amber-700 border-amber-100";
            barClass = "from-amber-400 to-orange-500 shadow-amber-200/50";
          }

          return (
            <div key={index} className="space-y-2.5 group transition-all duration-300">
              {/* Etiqueta y porcentaje */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 flex-shrink-0 mt-0.5 shadow-sm group-hover:border-indigo-500 group-hover:text-indigo-600 transition-all">
                    {item.subject}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-800 tracking-tight leading-snug group-hover:text-indigo-600 transition-all">
                      {item.nombre}
                    </p>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <span className={clsx(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm block",
                    badgeClass
                  )}>
                    {val}% LOGRO
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="relative">
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                  <div 
                    className={clsx("h-full rounded-full bg-gradient-to-r shadow-md transition-all duration-1000 ease-out", barClass)}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GraficoRadarDesempeno;
