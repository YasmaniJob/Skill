import { ClipboardList, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getKPIs } from '../../lib/dashboardUtils';

const ResumenCards = ({ monitoreos }) => {
  const kpis = getKPIs(monitoreos);

  const cards = [
    { 
      title: 'Destacado', 
      value: `${kpis.n4}%`, 
      icon: TrendingUp, 
      color: 'bg-green-500', 
      text: 'text-green-600',
      desc: 'Nivel 4'
    },
    { 
      title: 'Suficiente', 
      value: `${kpis.n3}%`, 
      icon: CheckCircle2, 
      color: 'bg-blue-500', 
      text: 'text-blue-600',
      desc: 'Nivel 3'
    },
    { 
      title: 'En Proceso', 
      value: `${kpis.n2}%`, 
      icon: ClipboardList, 
      color: 'bg-orange-500', 
      text: 'text-orange-600',
      desc: 'Nivel 2'
    },
    { 
      title: 'Muy Deficiente', 
      value: `${kpis.n1}%`, 
      icon: AlertTriangle, 
      color: 'bg-red-500', 
      text: 'text-red-600',
      desc: 'Nivel 1'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 md:gap-4 transition-all">
          <div className={`p-2.5 md:p-3 rounded-xl ${card.color} text-white flex-shrink-0`}>
            <card.icon className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
            <p className={`text-lg md:text-2xl font-black ${card.text}`}>{card.value}</p>
            <p className="hidden xs:block text-[8px] md:text-[9px] font-bold text-slate-400 uppercase mt-0.5">{card.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResumenCards;
