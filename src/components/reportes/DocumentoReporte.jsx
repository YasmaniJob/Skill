import React from 'react';
import { Page, Document, StyleSheet, View, Text } from '@react-pdf/renderer';
import { INDICADORES } from '../../data/indicadores';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5', // Indigo branding line
    paddingBottom: 12,
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A', // Slate 900
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 8,
    color: '#475569', // Slate 600
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerDateContainer: {
    alignItems: 'flex-end',
  },
  headerDateLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerDateVal: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5', // Indigo accent
    borderRadius: 6,
  },
  statsCardAlt: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9', // Sky blue accent
    borderRadius: 6,
  },
  statsLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 10,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statsBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
    minHeight: 35,
  },
  tableHeader: {
    backgroundColor: '#1E293B', // Deep dark slate header
    borderBottomWidth: 2,
    borderBottomColor: '#0F172A',
    minHeight: 35,
  },
  colFecha: { width: '10%', padding: 5 },
  colDocente: { width: '25%', padding: 5 },
  colAreaGrado: { width: '23%', padding: 5 },
  colIndicador: { width: '7%', padding: 5 },
  colPromedio: { width: '17%', padding: 5 },
  
  tableHeaderLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF', // 100% solid white contrast
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 8,
    color: '#0F172A', // Slate 900 contrast
  },
  tableCellMuted: {
    fontSize: 7,
    color: '#475569', // Slate 600 contrast
  },
  badgeLevel: {
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  footer: {
    marginTop: 25,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7.5,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});

// Helper de fecha a formato DD/MM/YYYY compacto
const formatFecha = (fechaStr) => {
  if (!fechaStr) return '—';
  try {
    const cleanStr = fechaStr.includes(' ') ? fechaStr.split(' ')[0] : fechaStr.split('T')[0];
    if (cleanStr.includes('-')) {
      const parts = cleanStr.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return fechaStr;
  } catch (e) {
    return fechaStr;
  }
};

const DocumentoReporte = ({ monitoreos }) => {
  const fechaGeneracion = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const avgScore = monitoreos.reduce((acc, m) => {
    const scores = INDICADORES.map(ind => m[ind.id] ?? 0);
    const p = scores.reduce((a, b) => a + b, 0) / scores.length;
    return acc + p;
  }, 0) / (monitoreos.length || 1);

  const roundedAvg = Math.round(avgScore);
  const NIVELES_MAP = {
    1: { etiqueta: 'MUY DEFICIENTE', color: '#DC2626' },
    2: { etiqueta: 'EN PROCESO',     color: '#D97706' },
    3: { etiqueta: 'SUFICIENTE',     color: '#2563EB' },
    4: { etiqueta: 'DESTACADO',      color: '#059669' }
  };
  const overallLevel = NIVELES_MAP[roundedAvg] || NIVELES_MAP[3];

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        
        {/* Encabezado con logo y branding */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.brandTitle}>SKILL — REPORTE PEDAGÓGICO</Text>
            <Text style={styles.brandSubtitle}>Sistema de Gestión de Acompañamiento {new Date().getFullYear()}</Text>
          </View>
          <View style={styles.headerDateContainer}>
            <Text style={styles.headerDateLabel}>GENERADO EL</Text>
            <Text style={styles.headerDateVal}>{fechaGeneracion}</Text>
          </View>
        </View>

        {/* Resumen de Métricas */}
        <View style={styles.statsRow}>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Total Registros</Text>
            <View style={styles.statsValueContainer}>
              <Text style={styles.statsValue}>{monitoreos.length}</Text>
              <View style={[styles.statsBadge, { backgroundColor: '#4F46E5' }]}>
                <Text style={{ color: '#FFFFFF', fontSize: 7, fontWeight: 'bold' }}>MONITOREOS</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statsCardAlt}>
            <Text style={styles.statsLabel}>Rendimiento Promedio</Text>
            <View style={styles.statsValueContainer}>
              <Text style={styles.statsValue}>{avgScore.toFixed(2)}</Text>
              <View style={[styles.statsBadge, { backgroundColor: overallLevel.color }]}>
                <Text style={{ color: '#FFFFFF', fontSize: 7, fontWeight: 'bold' }}>{overallLevel.etiqueta}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabla de Monitoreos */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.colDocente}><Text style={styles.tableHeaderLabel}>Docente</Text></View>
            <View style={styles.colAreaGrado}><Text style={styles.tableHeaderLabel}>Área / Grado</Text></View>
            <View style={styles.colIndicador}><Text style={[styles.tableHeaderLabel, { textAlign: 'center' }]}>I1</Text></View>
            <View style={styles.colIndicador}><Text style={[styles.tableHeaderLabel, { textAlign: 'center' }]}>I2</Text></View>
            <View style={styles.colIndicador}><Text style={[styles.tableHeaderLabel, { textAlign: 'center' }]}>I3</Text></View>
            <View style={styles.colIndicador}><Text style={[styles.tableHeaderLabel, { textAlign: 'center' }]}>I4</Text></View>
            <View style={styles.colIndicador}><Text style={[styles.tableHeaderLabel, { textAlign: 'center' }]}>I5</Text></View>
            <View style={styles.colPromedio}><Text style={[styles.tableHeaderLabel, { textAlign: 'center' }]}>Nivel de Logro</Text></View>
            <View style={styles.colFecha}><Text style={[styles.tableHeaderLabel, { textAlign: 'center' }]}>Fecha</Text></View>
          </View>

          {monitoreos.map((m, idx) => {
            const scores = INDICADORES.map(ind => m[ind.id] ?? 0);
            const prom = scores.reduce((a, b) => a + b, 0) / scores.length;
            const levelNum = Math.round(prom);
            const levelInfo = NIVELES_MAP[levelNum] || NIVELES_MAP[3];

            return (
              <View key={m.id} style={[styles.tableRow, idx % 2 === 0 ? {} : { backgroundColor: '#F8FAFC' }]}>
                <View style={styles.colDocente}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{m.nombre_docente}</Text>
                  <Text style={[styles.tableCellMuted, { marginTop: 1 }]}>DNI: {m.dni_docente}</Text>
                </View>
                <View style={styles.colAreaGrado}>
                  <Text style={styles.tableCell}>{m.area}</Text>
                  <Text style={[styles.tableCellMuted, { marginTop: 1 }]}>{m.grado}° {m.seccion}</Text>
                </View>
                {INDICADORES.map((ind) => (
                  <View key={ind.id} style={styles.colIndicador}>
                    <Text style={[styles.tableCell, { textAlign: 'center', fontWeight: 'bold' }]}>
                      {m[ind.id] ?? '—'}
                    </Text>
                  </View>
                ))}
                <View style={[styles.colPromedio, { alignItems: 'center', justifyContent: 'center' }]}>
                  <View style={[styles.badgeLevel, { backgroundColor: levelInfo.color }]}>
                    <Text style={{ color: '#FFFFFF', fontSize: 6.5, fontWeight: 'bold', textAlign: 'center' }}>
                      {levelInfo.etiqueta}
                    </Text>
                  </View>
                  <Text style={[styles.tableCellMuted, { marginTop: 2 }]}>
                    Prom: {prom.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.colFecha}>
                  <Text style={[styles.tableCell, { textAlign: 'center' }]}>{formatFecha(m.fecha)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Este reporte es un documento oficial generado por el sistema Skill y es apto para fines de acompañamiento pedagógico e institucional.
          </Text>
        </View>

      </Page>
    </Document>
  );
};

export default DocumentoReporte;
