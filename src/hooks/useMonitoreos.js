import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth.jsx';
import { toast } from 'react-hot-toast';

export const useMonitoreos = (filters = {}) => {
  const [monitoreos, setMonitoreos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, ieId } = useAuth();

  const fetchMonitoreos = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('monitoreos')
        .select(`
          *,
          docentes (id, dni, nombre_completo),
          periodos (id, nombre, anio, numero_visita, estado)
        `)
        .order('fecha', { ascending: false });

      if (filters.periodo_id) query = query.eq('periodo_id', filters.periodo_id);
      if (filters.area)       query = query.eq('area', filters.area);
      if (filters.grado)      query = query.eq('grado', filters.grado);
      if (filters.seccion)    query = query.eq('seccion', filters.seccion);
      if (filters.docente_id) query = query.eq('docente_id', filters.docente_id);
      if (filters.fechaDesde) query = query.gte('fecha', filters.fechaDesde);
      if (filters.fechaHasta) query = query.lte('fecha', filters.fechaHasta);

      if (filters.solo_mis_registros && user?.id) {
        query = query.eq('registrado_por', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Mapear para compatibilidad con la UI (scores directos)
      const mapped = (data || []).map(r => {
        return {
          ...r,
          involucra_estudiantes: Number(r.involucra_estudiantes || 0),
          promueve_razonamiento: Number(r.promueve_razonamiento || 0),
          evalua_progreso: Number(r.evalua_progreso || 0),
          propicia_ambiente: Number(r.propicia_ambiente || 0),
          regula_comportamiento: Number(r.regula_comportamiento || 0),
          periodo: r.periodos,
          nombre_docente: r.docentes?.nombre_completo || 'Desconocido',
          dni_docente: r.docentes?.dni || '',
          observaciones: r.observaciones || ''
        };
      });

      setMonitoreos(mapped);
    } catch (error) {
      console.error('Error fetching monitoreos:', error);
      toast.error('Error al cargar los registros');
    } finally {
      setLoading(false);
    }
  }, [
    filters.periodo_id,
    filters.area,
    filters.grado,
    filters.seccion,
    filters.docente_id,
    filters.fechaDesde,
    filters.fechaHasta,
    filters.solo_mis_registros,
    user?.id
  ]);

  useEffect(() => { fetchMonitoreos(); }, [fetchMonitoreos]);

  const addMonitoreo = async (data) => {
    try {
      // 1. Resolver el DNI al ID de la relación de docentes en Supabase
      let docenteId = null;
      try {
        const { data: doc, error: docErr } = await supabase
          .from('docentes')
          .select('id')
          .eq('dni', data.dni_docente)
          .eq('ie_id', ieId)
          .single();
        
        if (!docErr && doc) {
          docenteId = doc.id;
        }
      } catch (err) {
        console.error("Error buscando docente por DNI:", data.dni_docente, err);
      }

      // 2. Insertar en Supabase con columnas aplanadas
      const { error } = await supabase
        .from('monitoreos')
        .insert({
          periodo_id: data.periodo_id,
          docente_id: docenteId,
          area: data.area,
          grado: data.grado,
          seccion: data.seccion,
          fecha: data.fecha || new Date().toISOString().split('T')[0],
          involucra_estudiantes: Number(data.involucra_estudiantes || 0),
          promueve_razonamiento: Number(data.promueve_razonamiento || 0),
          evalua_progreso: Number(data.evalua_progreso || 0),
          propicia_ambiente: Number(data.propicia_ambiente || 0),
          regula_comportamiento: Number(data.regula_comportamiento || 0),
          observaciones: data.observaciones || '',
          registrado_por: user?.id
        });

      if (error) throw error;

      toast.success('Registro guardado exitosamente');
      fetchMonitoreos();
      return true;
    } catch (error) {
      console.error("Error al guardar monitoreo:", error);
      toast.error('Error al guardar el registro');
      return false;
    }
  };

  const deleteMonitoreo = async (id) => {
    try {
      const { error } = await supabase
        .from('monitoreos')
        .delete()
        .eq('id', id);
      if (error) throw error;

      toast.success('Registro eliminado');
      fetchMonitoreos();
      return true;
    } catch (error) {
      toast.error('No tienes permiso para eliminar este registro');
      return false;
    }
  };

  return { monitoreos, loading, addMonitoreo, deleteMonitoreo, refresh: fetchMonitoreos };
};
