import FormularioMonitoreo from '../components/monitoreo/FormularioMonitoreo';

const Monitoreo = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Nuevo Monitoreo</h1>
        <p className="text-slate-500">Registre una nueva observación pedagógica en el aula.</p>
      </div>
      
      <div className="w-full">
        <FormularioMonitoreo />
      </div>
    </div>
  );
};

export default Monitoreo;
