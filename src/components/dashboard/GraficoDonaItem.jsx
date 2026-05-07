import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const GraficoDonaItem = ({ indicador }) => {
  const { nombre, abrev, data, total } = indicador;

  return (
    <div className="bg-[#121316] p-6 rounded-lg border border-white/10 flex flex-col items-center">
      <div className="text-center mb-4">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{abrev}</h4>
        <p className="text-xs font-semibold text-slate-300 leading-tight h-8 flex items-center justify-center px-2">
          {nombre}
        </p>
      </div>

      <div className="relative w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              labelLine={false}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const { name, value, fill } = payload[0].payload;
                  const percent = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                  return (
                    <div className="bg-[#1a1b1e] p-3 border border-white/10 rounded-md shadow-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fill }} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{name}</span>
                      </div>
                      <p className="text-sm font-bold text-white">
                        {value} {value === 1 ? 'Docente' : 'Docentes'} <span className="text-[#5e6ad2] font-bold ml-1">({percent}%)</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Centro de la Dona */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-white tracking-tighter">{total}</span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total</span>
        </div>
      </div>

      {/* Leyenda Linear-style */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full pt-4 border-t border-white/5">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.fill }} />
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-tight">{entry.name}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-300">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GraficoDonaItem;
