import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';

const GraficoRadarDesempeno = ({ data }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">Huella Pedagógica</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">% de logro por indicador (Nivel 3+)</p>
      </div>

      <div className="flex-1 min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#f1f5f9" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: '#cbd5e1', fontSize: 9 }}
              axisLine={false}
            />
            <Radar
              name="Logro %"
              dataKey="A"
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.15}
              strokeWidth={3}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#4f46e5] p-4 border border-[#4f46e5] text-white shadow-none rounded-lg">
                      <p className="text-[10px] font-black uppercase tracking-wider mb-2">{payload[0].payload.nombre}</p>
                      <p className="text-sm font-black text-white/90">{payload[0].value}% de Logro</p>
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
