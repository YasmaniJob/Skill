import GestionPeriodos from '../components/periodos/GestionPeriodos';

const Periodos = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Periodos de Monitoreo</h1>
        <p className="text-slate-500 mt-1">
          Gestión de las visitas de monitoreo pedagógico del año escolar.
        </p>
      </div>
      <GestionPeriodos />
    </div>
  );
};

export default Periodos;
