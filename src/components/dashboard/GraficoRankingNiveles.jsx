import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const GraficoRankingNiveles = ({ data }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">Desempeño por Docente</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Niveles de logro acumulados (Top 10)</p>
      </div>

      <div className="flex-1 min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            barSize={16}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              width={120}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
              contentStyle={{ background: '#4f46e5', border: 'none', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
              itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}
            />
            <Legend 
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Bar dataKey="n4" name="N4" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
            <Bar dataKey="n3" name="N3" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            <Bar dataKey="n2" name="N2" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            <Bar dataKey="n1" name="N1" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraficoRankingNiveles;
