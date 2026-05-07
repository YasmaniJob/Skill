import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const GraficoRankingNiveles = ({ data }) => {
  return (
    <div className="bg-[#121316] p-8 rounded-lg border border-white/10 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Desempeño por Docente</h3>
        <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Niveles de logro acumulados (Top 10)</p>
      </div>

      <div className="flex-1 min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            barSize={12}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
              width={120}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
              contentStyle={{ background: '#1a1b1e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', fontSize: '11px' }}
              itemStyle={{ fontSize: '10px', fontWeight: 600 }}
            />
            <Legend 
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
            <Bar dataKey="n4" name="N4" stackId="a" fill="#10b981" />
            <Bar dataKey="n3" name="N3" stackId="a" fill="#3b82f6" />
            <Bar dataKey="n2" name="N2" stackId="a" fill="#f59e0b" />
            <Bar dataKey="n1" name="N1" stackId="a" fill="#ef4444" radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraficoRankingNiveles;
