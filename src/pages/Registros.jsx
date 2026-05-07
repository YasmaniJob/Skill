import TablaMonitoreos from '../components/monitoreo/TablaMonitoreos';
import { ListChecks } from 'lucide-react';

const Registros = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Historial de Registros</h1>
          <p className="text-slate-500">Gestión y consulta de todos los monitoreos realizados.</p>
        </div>
      </div>
      
      <TablaMonitoreos />
    </div>
  );
};

export default Registros;
