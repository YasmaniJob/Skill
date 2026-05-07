import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { INDICADORES, NIVELES } from '../../data/indicadores';

const GraficoIndicador = ({ monitoreos }) => {
  const data = INDICADORES.map(ind => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    monitoreos.forEach(m => {
      counts[m[ind.id]]++;
    });

    return {
      name: ind.id.split('_').map(w => w[0].toUpperCase()).join(''), // Abbreviation
      full: ind.nombre,
      [NIVELES[1].etiqueta]: counts[1],
      [NIVELES[2].etiqueta]: counts[2],
      [NIVELES[3].etiqueta]: counts[3],
      [NIVELES[4].etiqueta]: counts[4],
    };
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Desempeño por Indicador</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey={NIVELES[1].etiqueta} fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey={NIVELES[2].etiqueta} fill="#f97316" radius={[4, 4, 0, 0]} />
          <Bar dataKey={NIVELES[3].etiqueta} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey={NIVELES[4].etiqueta} fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoIndicador;
