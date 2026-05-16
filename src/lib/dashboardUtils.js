import { INDICADORES } from '../data/indicadores';

/**
 * Procesa los monitoreos para obtener la distribución de niveles por indicador.
 */
export const getDistribucionPorIndicador = (monitoreos) => {
  return INDICADORES.map(ind => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    monitoreos.forEach(m => {
      const valor = Math.round(m[ind.id]);
      if (counts[valor] !== undefined) counts[valor]++;
    });
    
    return {
      ...ind,
      data: [
        { name: 'Muy deficiente', value: counts[1], level: 1, fill: '#ef4444' },
        { name: 'En proceso',     value: counts[2], level: 2, fill: '#f97316' },
        { name: 'Suficiente',      value: counts[3], level: 3, fill: '#3b82f6' },
        { name: 'Destacado',       value: counts[4], level: 4, fill: '#22c55e' },
      ],
      total: monitoreos.length
    };
  });
};

/**
 * Calcula el % de logro (Nivel 3 o 4) por indicador para el gráfico de radar.
 */
export const getLogroPorIndicador = (monitoreos) => {
  if (monitoreos.length === 0) return INDICADORES.map(ind => ({ subject: ind.abrev, A: 0, fullMark: 100 }));

  return INDICADORES.map(ind => {
    const logrados = monitoreos.filter(m => Math.round(m[ind.id]) >= 3).length;
    return {
      subject: ind.abrev,
      nombre: ind.nombre,
      A: Number(((logrados / monitoreos.length) * 100).toFixed(0)),
      fullMark: 100
    };
  });
};

/**
 * Obtiene el ranking de docentes basado en niveles de logro (apilado).
 */
export const getRankingDocentes = (monitoreos) => {
  const docentesMap = {};

  monitoreos.forEach(m => {
    const nombre = m.nombre_docente || 'Desconocido';
    if (!docentesMap[nombre]) {
      docentesMap[nombre] = { name: nombre, n1: 0, n2: 0, n3: 0, n4: 0, totalItems: 0 };
    }
    
    // Contamos cada ítem observado para este docente (Sin promediar)
    INDICADORES.forEach(ind => {
      const level = Math.round(m[ind.id]);
      if (level === 1) docentesMap[nombre].n1++;
      if (level === 2) docentesMap[nombre].n2++;
      if (level === 3) docentesMap[nombre].n3++;
      if (level === 4) docentesMap[nombre].n4++;
      docentesMap[nombre].totalItems++;
    });
  });

  return Object.values(docentesMap)
    .sort((a, b) => (b.n4 + b.n3) - (a.n4 + a.n3)) // Ordenar por cantidad de ítems logrados
    .slice(0, 10);
};

/**
 * KPIs generales basados en niveles.
 */
export const getKPIs = (monitoreos) => {
  const totalMonitoreos = monitoreos.length;
  if (totalMonitoreos === 0) return { total: 0, n1: 0, n2: 0, n3: 0, n4: 0 };

  const totalItemsObservados = totalMonitoreos * INDICADORES.length;
  const counts = { n1: 0, n2: 0, n3: 0, n4: 0 };

  monitoreos.forEach(m => {
    // Contamos cada indicador por separado (Sin promediar)
    INDICADORES.forEach(ind => {
      const valor = Math.round(m[ind.id]);
      if (valor >= 1 && valor <= 4) {
        counts[`n${valor}`]++;
      }
    });
  });

  return {
    total: totalMonitoreos,
    n1: ((counts.n1 / totalItemsObservados) * 100).toFixed(0),
    n2: ((counts.n2 / totalItemsObservados) * 100).toFixed(0),
    n3: ((counts.n3 / totalItemsObservados) * 100).toFixed(0),
    n4: ((counts.n4 / totalItemsObservados) * 100).toFixed(0),
  };
};
