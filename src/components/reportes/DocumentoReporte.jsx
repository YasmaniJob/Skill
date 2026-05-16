import React from 'react';
import { Page, Document, StyleSheet, View } from '@react-pdf/renderer';
import { Heading } from '../pdfx/heading/pdfx-heading';
import { Text } from '../pdfx/text/pdfx-text';
import { Stack } from '../pdfx/stack/pdfx-stack';
import { PdfxThemeProvider } from '../../lib/pdfx-theme-context';
import { INDICADORES } from '../../data/indicadores';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 20,
    marginBottom: 30,
  },
  table: {
    width: 'auto',
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#F1F5F9',
    borderBottomWidth: 1,
    alignItems: 'center',
    minHeight: 35,
  },
  tableHeader: {
    backgroundColor: '#F8FAF6',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 2,
    minHeight: 40,
  },
  tableCol: {
    width: '10%',
    padding: 5,
  },
  tableColWide: {
    width: '25%',
    padding: 5,
  },
  tableHeaderLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 8,
    color: '#334155',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 20,
    marginTop: 40,
  }
});

const DocumentoReporte = ({ monitoreos }) => {
  const fechaGeneracion = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <PdfxThemeProvider>
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          
          {/* Encabezado */}
          <View style={styles.header}>
            <Stack direction="horizontal" justify="between" align="center">
              <Stack gap="none">
                <Heading level={2} color="primary" transform="uppercase" tracking="wide">
                  Skill — Reporte Pedagógico
                </Heading>
                <Text variant="xs" color="muted">Sistema de Gestión de Acompañamiento {new Date().getFullYear()}</Text>
              </Stack>
              <Text variant="xs" color="muted">Generado el {fechaGeneracion}</Text>
            </Stack>
          </View>

          {/* Estadísticas Rápidas */}
          <Stack direction="horizontal" gap="lg" style={{ marginBottom: 20 }}>
            <Stack gap="none" style={{ flex: 1, padding: 15, backgroundColor: '#F1F5F9', borderRadius: 6 }}>
              <Text variant="xs" weight="bold" color="muted" transform="uppercase">Total Registros</Text>
              <Heading level={3} noMargin>{monitoreos.length}</Heading>
            </Stack>
            <Stack gap="none" style={{ flex: 1, padding: 15, backgroundColor: '#F1F5F9', borderRadius: 6 }}>
              <Text variant="xs" weight="bold" color="muted" transform="uppercase">Rendimiento Promedio</Text>
              <Heading level={3} noMargin>
                {(monitoreos.reduce((acc, m) => {
                  const scores = INDICADORES.map(ind => m[ind.id] ?? 0);
                  const p = scores.reduce((a, b) => a + b, 0) / scores.length;
                  return acc + p;
                }, 0) / (monitoreos.length || 1)).toFixed(2)}
              </Heading>
            </Stack>
          </Stack>

          {/* Tabla de Monitoreos */}
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableHeaderLabel}>Fecha</Text></View>
              <View style={styles.tableColWide}><Text style={styles.tableHeaderLabel}>Docente</Text></View>
              <View style={styles.tableColWide}><Text style={styles.tableHeaderLabel}>Área / Grado</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableHeaderLabel} align="center">I1</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableHeaderLabel} align="center">I2</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableHeaderLabel} align="center">I3</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableHeaderLabel} align="center">I4</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableHeaderLabel} align="center">I5</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableHeaderLabel} align="center">Prom</Text></View>
            </View>

            {monitoreos.map((m, idx) => {
              const scores = INDICADORES.map(ind => m[ind.id] ?? 0);
              const prom = scores.reduce((a, b) => a + b, 0) / scores.length;
              return (
                <View key={m.id} style={[styles.tableRow, idx % 2 === 0 ? {} : { backgroundColor: '#FBFCFD' }]}>
                  <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCell}>{m.fecha}</Text></View>
                  <View style={styles.tableColWide}>
                    <Stack gap="none">
                      <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{m.nombre_docente}</Text>
                      <Text style={{ fontSize: 7, color: '#94A3B8' }}>DNI: {m.dni_docente}</Text>
                    </Stack>
                  </View>
                  <View style={styles.tableColWide}>
                    <Text style={styles.tableCell}>{m.area} ({m.grado}-{m.seccion})</Text>
                  </View>
                  {INDICADORES.map((ind, i) => (
                    <View key={ind.id} style={styles.tableCol}>
                      <Text style={styles.tableCell} align="center">{m[ind.id]}</Text>
                    </View>
                  ))}
                  <View style={styles.tableCol}>
                    <Text style={[styles.tableCell, { fontWeight: 'bold', color: prom >= 3 ? '#059669' : '#DC2626' }]} align="center">
                      {prom.toFixed(1)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Footer Informativo */}
          <View style={{ marginTop: 50, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20 }}>
            <Text variant="xs" color="muted" align="center italic">
            Este reporte es un documento generado por el sistema Skill y tiene carácter informativo para la gestión pedagógica.
            </Text>
          </View>

        </Page>
      </Document>
    </PdfxThemeProvider>
  );
};

export default DocumentoReporte;
