import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const INDICATOR_THEMES = {
  'IE': { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-800', accent: 'bg-indigo-600' },
  'PR': { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-800', accent: 'bg-blue-600' },
  'EP': { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-800', accent: 'bg-violet-600' },
  'PA': { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800', accent: 'bg-emerald-600' },
  'RC': { bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-800', accent: 'bg-cyan-600' },
};

const GraficoDonaItem = ({ indicador }) => {
  const { nombre, abrev, data, total } = indicador;
  const theme = INDICATOR_THEMES[abrev] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', accent: 'bg-[#4f46e5]' };

  return (
    <div className={`${theme.bg} p-6 rounded-lg border ${theme.border} flex flex-col items-center transition-all hover:bg-white group`}>
      {/* Header con Contraste */}
      <div className="text-center mb-6">
        <div className={`inline-block px-2.5 py-1 ${theme.accent} text-white text-[9px] font-black uppercase tracking-[0.2em] mb-3 rounded`}>
          {abrev}
        </div>
        <p className="text-[11px] font-bold text-slate-800 leading-tight h-10 flex items-center justify-center px-1">
          {nombre}
        </p>
      </div>

      <div className="relative w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
              labelLine={false}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const { name, value, fill } = payload[0].payload;
                  const percent = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                  return (
                    <div className="bg-slate-900 p-2.5 rounded shadow-xl border border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: fill }} />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{name}</span>
                      </div>
                      <p className="text-[11px] font-black text-white">
                        {value} Docentes <span className="text-indigo-400 ml-1">{percent}%</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Centro de la Dona con Máxima Legibilidad */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm w-16 h-16 rounded-full flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{total}</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Total</span>
          </div>
        </div>
      </div>

      {/* Leyenda con Contraste */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-8 w-full pt-5 border-t border-slate-200/60">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{entry.name}</span>
            </div>
            <span className="text-[10px] font-black text-slate-800">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GraficoDonaItem;
