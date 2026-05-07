import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const GraficoRankingNiveles = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Perfil de Desempeño por Docente</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Top 10 docentes según niveles de logro</p>
        </div>
      </div>

      <div className="flex-1 min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
              width={100}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend 
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
            />
            <Bar dataKey="n4" name="Destacado" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
            <Bar dataKey="n3" name="Suficiente" stackId="a" fill="#3b82f6" />
            <Bar dataKey="n2" name="En Proceso" stackId="a" fill="#f97316" />
            <Bar dataKey="n1" name="Muy Deficiente" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraficoRankingNiveles;
