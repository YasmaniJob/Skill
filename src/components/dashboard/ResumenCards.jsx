import { ClipboardList, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getKPIs } from '../../lib/dashboardUtils';

const ResumenCards = ({ monitoreos }) => {
  const kpis = getKPIs(monitoreos);

  const cards = [
    { 
      title: 'Destacado', 
      value: `${kpis.n4}%`, 
      icon: TrendingUp, 
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', 
      desc: 'Nivel 4'
    },
    { 
      title: 'Suficiente', 
      value: `${kpis.n3}%`, 
      icon: CheckCircle2, 
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', 
      desc: 'Nivel 3'
    },
    { 
      title: 'En Proceso', 
      value: `${kpis.n2}%`, 
      icon: ClipboardList, 
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', 
      desc: 'Nivel 2'
    },
    { 
      title: 'Deficiente', 
      value: `${kpis.n1}%`, 
      icon: AlertTriangle, 
      color: 'bg-red-500/10 text-red-500 border-red-500/20', 
      desc: 'Nivel 1'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-[#121316] p-5 rounded-lg border border-white/10 flex flex-col gap-3 transition-all hover:border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.title}</span>
            <div className={`p-1.5 rounded border ${card.color}`}>
              <card.icon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
            <p className="text-[10px] font-medium text-slate-600 mt-0.5">{card.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResumenCards;
