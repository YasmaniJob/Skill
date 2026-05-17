import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { INDICADORES } from '../../data/indicadores';

const GraficoDocente = ({ monitoreos }) => {
  const teacherStats = {};
  monitoreos.forEach(m => {
    const scores = INDICADORES.map(ind => m[ind.id] ?? 0);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (!teacherStats[m.nombre_docente]) {
      teacherStats[m.nombre_docente] = { sum: 0, count: 0 };
    }
    teacherStats[m.nombre_docente].sum += avg;
    teacherStats[m.nombre_docente].count += 1;
  });

  const data = Object.keys(teacherStats).map(name => ({
    name,
    promedio: (teacherStats[name].sum / teacherStats[name].count).toFixed(2),
  })).sort((a, b) => b.promedio - a.promedio).slice(0, 10); // Top 10

  const getColor = (val) => {
    if (val >= 3.5) return '#22c55e';
    if (val >= 2.5) return '#3b82f6';
    if (val >= 1.5) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Promedio por Docente (Top 10)</h3>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" domain={[0, 4]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={120} />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey="promedio" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(parseFloat(entry.promedio))} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoDocente;
