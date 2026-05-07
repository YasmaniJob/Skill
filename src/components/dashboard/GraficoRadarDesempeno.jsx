import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';

const GraficoRadarDesempeno = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Huella Pedagógica</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase">% de logro por indicador (Nivel 3+)</p>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 800 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: '#cbd5e1', fontSize: 10 }}
            />
            <Radar
              name="Logro %"
              dataKey="A"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.3}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{payload[0].payload.nombre}</p>
                      <p className="text-sm font-black text-sky-600">{payload[0].value}% de Logro</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraficoRadarDesempeno;
