import { ClipboardList, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getKPIs } from '../../lib/dashboardUtils';

const ResumenCards = ({ monitoreos }) => {
  const kpis = getKPIs(monitoreos);

  const cards = [
    { 
      title: 'Destacado', 
      value: `${kpis.n4}%`, 
      icon: TrendingUp, 
      bgColor: 'bg-emerald-50', 
      borderColor: 'border-emerald-100',
      textColor: 'text-emerald-700',
      iconColor: 'bg-emerald-500 text-white',
      desc: 'Nivel 4'
    },
    { 
      title: 'Suficiente', 
      value: `${kpis.n3}%`, 
      icon: CheckCircle2, 
      bgColor: 'bg-blue-50', 
      borderColor: 'border-blue-100',
      textColor: 'text-blue-700',
      iconColor: 'bg-blue-600 text-white',
      desc: 'Nivel 3'
    },
    { 
      title: 'En Proceso', 
      value: `${kpis.n2}%`, 
      icon: ClipboardList, 
      bgColor: 'bg-amber-50', 
      borderColor: 'border-amber-100',
      textColor: 'text-amber-700',
      iconColor: 'bg-amber-500 text-white',
      desc: 'Nivel 2'
    },
    { 
      title: 'Deficiente', 
      value: `${kpis.n1}%`, 
      icon: AlertTriangle, 
      bgColor: 'bg-red-50', 
      borderColor: 'border-red-100',
      textColor: 'text-red-700',
      iconColor: 'bg-red-600 text-white',
      desc: 'Nivel 1'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className={`p-4 rounded-lg border ${card.bgColor} ${card.borderColor} flex flex-col gap-3 transition-all`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[9px] font-black uppercase tracking-widest ${card.textColor} opacity-60`}>
              {card.title}
            </span>
            <div className={`p-1 rounded ${card.iconColor}`}>
              <card.icon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-black tracking-tighter ${card.textColor}`}>
              {card.value}
            </p>
            <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${card.textColor} opacity-50`}>
              {card.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResumenCards;
