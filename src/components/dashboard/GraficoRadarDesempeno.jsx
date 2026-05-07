import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';

const GraficoRadarDesempeno = ({ data }) => {
  return (
    <div className="bg-[#121316] p-8 rounded-lg border border-white/10 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Huella Pedagógica</h3>
        <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">% de logro por indicador (Nivel 3+)</p>
      </div>

      <div className="flex-1 min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.05)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: '#334155', fontSize: 9 }}
              axisLine={false}
            />
            <Radar
              name="Logro %"
              dataKey="A"
              stroke="#5e6ad2"
              fill="#5e6ad2"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#1a1b1e] p-3 border border-white/10 rounded-md shadow-2xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{payload[0].payload.nombre}</p>
                      <p className="text-sm font-bold text-[#5e6ad2]">{payload[0].value}% de Logro</p>
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
