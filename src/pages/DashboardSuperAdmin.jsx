import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  Building2, Users, ClipboardList, Loader2,
  ToggleRight, ToggleLeft, ArrowRight, RefreshCcw, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-[#4f46e5]/5 text-[#4f46e5] border-[#4f46e5]/10',
    green:  'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber:  'bg-amber-50 text-amber-700 border-amber-100',
    slate:  'bg-slate-50 text-slate-700 border-slate-200',
  };
  return (
    <div className={`rounded-lg border p-5 flex items-center gap-4 ${colors[color]}`}>
      <div className="p-2 rounded-md bg-white/60">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-black tracking-tight leading-none">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">{label}</p>
      </div>
    </div>
  );
};

const DashboardSuperAdmin = () => {
  const [stats, setStats] = useState(null);
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [iesRes, docentesRes, monitoreosRes, periodosRes] = await Promise.all([
        supabase.from('instituciones').select('*').order('nombre'),
        supabase.from('docentes').select('*', { count: 'exact', head: true }),
        supabase.from('monitoreos').select('*', { count: 'exact', head: true }),
        supabase.from('periodos').select('*', { count: 'exact', head: true }),
      ]);

      if (iesRes.error) throw iesRes.error;
      if (docentesRes.error) throw docentesRes.error;
      if (monitoreosRes.error) throw monitoreosRes.error;
      if (periodosRes.error) throw periodosRes.error;

      const ies = iesRes.data || [];

      setInstituciones(ies);
      setStats({
        totalIEs: ies.length,
        iesActivas: ies.filter(i => i.estado === 'activo').length,
        totalDocentes: docentesRes.count || 0,
        totalMonitoreos: monitoreosRes.count || 0,
        totalPeriodos: periodosRes.count || 0,
      });
    } catch (err) {
      console.error('Error cargando stats super admin:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#4f46e5]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            Panel Super Admin
          </h1>
          <p className="text-slate-400 font-bold text-[9px] mt-1 uppercase tracking-widest">
            Vista global · Todas las instituciones
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-all font-black text-[11px] uppercase tracking-widest rounded-lg"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Building2}    label="Instituciones"  value={stats.totalIEs}       color="indigo" />
          <StatCard icon={CheckCircle2} label="IEs Activas"    value={stats.iesActivas}     color="green"  />
          <StatCard icon={Users}        label="Docentes"       value={stats.totalDocentes}  color="slate"  />
          <StatCard icon={ClipboardList} label="Monitoreos"   value={stats.totalMonitoreos} color="amber"  />
        </div>
      )}

      {/* Tabla de IEs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-3 w-1 bg-slate-900 rounded-full" />
            <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
              Instituciones Educativas
            </h2>
          </div>
          <Link
            to="/instituciones"
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#4f46e5] hover:underline"
          >
            Gestionar IEs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institución</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">UGEL</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {instituciones.map((ie, i) => (
                <motion.tr
                  key={ie.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{ie.nombre}</p>
                        {ie.codigo_minedu && (
                          <p className="text-[10px] text-slate-400">{ie.codigo_minedu}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">
                    {ie.ugel || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                      ie.estado === 'activo'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {ie.estado === 'activo'
                        ? <ToggleRight className="w-3.5 h-3.5" />
                        : <ToggleLeft className="w-3.5 h-3.5" />
                      }
                      {ie.estado}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {instituciones.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-16 text-center">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-medium">No hay instituciones registradas</p>
                    <Link to="/instituciones" className="text-[11px] font-bold text-[#4f46e5] hover:underline mt-1 inline-block">
                      Crear primera IE →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardSuperAdmin;
