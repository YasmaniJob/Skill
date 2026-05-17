import { Trophy, Award, Star, User } from 'lucide-react';
import { clsx } from 'clsx';

const GraficoRankingNiveles = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center p-8">
        <Award className="w-12 h-12 text-slate-300 mb-2 animate-pulse" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sin registros de desempeño</p>
      </div>
    );
  }

  const sortedData = data
    .map(d => {
      const totalScore = (d.n1 * 1) + (d.n2 * 2) + (d.n3 * 3) + (d.n4 * 4);
      const average = d.totalItems > 0 ? (totalScore / d.totalItems) : 0;
      const percentage = (average / 4) * 100;
      return { ...d, average, percentage };
    })
    .sort((a, b) => b.average - a.average);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">Desempeño por Docente</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Ranking de Logros (Top 10)</p>
        </div>
        <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 shrink-0">
          <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[380px] custom-scrollbar">
        {sortedData.map((d, index) => {
          const rank = index + 1;
          const levelNum = Math.round(d.average);
          
          const NIVELES = {
            1: { etiqueta: 'MUY DEFICIENTE', badge: 'text-rose-600 bg-rose-50 border-rose-100', barColor: 'from-rose-500 to-rose-400' },
            2: { etiqueta: 'EN PROCESO',     badge: 'text-amber-600 bg-amber-50 border-amber-100', barColor: 'from-amber-500 to-amber-400' },
            3: { etiqueta: 'SUFICIENTE',     badge: 'text-blue-600 bg-blue-50 border-blue-100', barColor: 'from-indigo-500 to-blue-500' },
            4: { etiqueta: 'DESTACADO',      badge: 'text-emerald-600 bg-emerald-50 border-emerald-100', barColor: 'from-emerald-500 to-teal-500' }
          };
          const nivel = NIVELES[levelNum] || NIVELES[3];

          // Estilo de Rango Premium
          const getRankStyle = (r) => {
            if (r === 1) return { bg: 'bg-amber-50 border-amber-200 text-amber-600', icon: <Trophy className="w-3.5 h-3.5 text-amber-500" /> };
            if (r === 2) return { bg: 'bg-slate-100 border-slate-200 text-slate-600', icon: <Award className="w-3.5 h-3.5 text-slate-500" /> };
            if (r === 3) return { bg: 'bg-orange-50 border-orange-200 text-orange-600', icon: <Star className="w-3.5 h-3.5 text-orange-500" /> };
            return { bg: 'bg-slate-50 border-slate-100 text-slate-400 font-bold', icon: <span className="text-[10px]">{r}</span> };
          };
          
          const rankStyle = getRankStyle(rank);

          return (
            <div key={d.name} className="flex items-center gap-3.5 p-3 bg-slate-50/40 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all duration-300 group">
              {/* Posición / Rango */}
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${rankStyle.bg}`}>
                {rankStyle.icon}
              </div>

              {/* Info Docente */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <span className="text-[12px] font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors uppercase">
                    {d.name.toLowerCase()}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[8px] font-black px-2 py-0.5 border rounded-md uppercase tracking-wider ${nivel.badge}`}>
                      {nivel.etiqueta}
                    </span>
                    <span className="text-[10px] font-black text-slate-900 bg-white px-2 py-0.5 border border-slate-200 rounded-md font-mono">
                      {d.average.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Premium */}
                <div className="relative w-full h-1.5 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${nivel.barColor} transition-all duration-1000 ease-out`}
                    style={{ width: `${d.percentage}%` }}
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

export default GraficoRankingNiveles;
