import TablaMonitoreos from '../components/monitoreo/TablaMonitoreos';

const Registros = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Monitoreos</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
          Historial y gestión de observaciones realizadas
        </p>
      </div>
      
      <div className="w-full">
        <TablaMonitoreos />
      </div>
    </div>
  );
};

export default Registros;
