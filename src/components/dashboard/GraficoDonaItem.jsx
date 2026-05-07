import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const GraficoDonaItem = ({ indicador }) => {
  const { nombre, abrev, data, total } = indicador;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col items-center">
      <div className="text-center mb-2">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{abrev}</h4>
        <p className="text-xs font-bold text-slate-700 leading-tight h-8 flex items-center justify-center px-2">
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
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              labelLine={false}
              label={({ value }) => value > 0 ? value : ''}
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
                    <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fill }} />
                        <span className="text-[10px] font-black text-slate-400 uppercase">{name}</span>
                      </div>
                      <p className="text-sm font-black text-slate-800">
                        {value} {value === 1 ? 'Docente' : 'Docentes'} <span className="text-slate-400 font-bold ml-1">({percent}%)</span>
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
          <span className="text-2xl font-black text-slate-800">{total}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Total</span>
        </div>
      </div>

      {/* Leyenda Simple */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 w-full">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
              <span className="text-[9px] font-bold text-slate-500 uppercase">{entry.name}</span>
            </div>
            <span className="text-[9px] font-black text-slate-700">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GraficoDonaItem;
