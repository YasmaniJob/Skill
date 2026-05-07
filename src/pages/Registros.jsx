import TablaMonitoreos from '../components/monitoreo/TablaMonitoreos';

const Registros = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Historial de Registros</h1>
        <p className="text-sm text-slate-500 mt-1 uppercase font-medium tracking-widest">Gestión de monitoreos realizados</p>
      </div>
      
      <TablaMonitoreos />
    </div>
  );
};

export default Registros;
