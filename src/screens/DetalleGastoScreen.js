import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppBackground from '../components/AppBackground';

const CATEGORIA_ICONOS = {
  alquiler:     { icon: 'home-outline',    color: '#42a5f5' },
  luz:          { icon: 'flash-outline',   color: '#ffa726' },
  agua:         { icon: 'water-outline',   color: '#29b6f6' },
  internet:     { icon: 'wifi-outline',    color: '#66bb6a' },
  alimentacion: { icon: 'cart-outline',    color: '#ef5350' },
  limpieza:     { icon: 'sparkles-outline',color: '#ab47bc' },
  ajuste:       { icon: 'swap-horizontal-outline', color: '#26a69a' },
  otros:        { icon: 'receipt-outline', color: '#888'    },
};

function getIcono(categoria = '') {
  return CATEGORIA_ICONOS[categoria.toLowerCase()] || CATEGORIA_ICONOS.otros;
}

const MODO_LABEL = {
  igualitario: '⚖️ Igualitario',
  plantilla:   '📋 Plantilla',
  manual:      '✏️ Manual',
};

export default function DetalleGastoScreen({ route, navigation }) {
  const { gasto } = route.params;
  const { icon, color } = getIcono(gasto.categoria);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppBackground>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconoCategoria, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon} size={28} color={color} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.title}>{gasto.concepto}</Text>
              {gasto.categoria && (
                <Text style={styles.categoria}>{gasto.categoria}</Text>
              )}
            </View>
          </View>

          {/* Importe principal */}
          <View style={styles.importeCard}>
            <Text style={styles.importeLabel}>Total</Text>
            <Text style={styles.importeValor}>{gasto.importe.toFixed(2)} €</Text>
            <Text style={styles.importeMeta}>
              Pagado por <Text style={styles.importeEmisor}>{gasto.emisor}</Text>
              {gasto.fecha ? ` · ${gasto.fecha}` : ''}
            </Text>
          </View>

          {/* Modo división */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitle}>Modo de división</Text>
            <Text style={styles.modoBadge}>
              {MODO_LABEL[gasto.modo_division] || gasto.modo_division}
            </Text>
          </View>

          {/* División por persona */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitle}>Desglose por persona</Text>
            {(gasto.division || []).map((d, i) => (
              <View key={i} style={styles.divisionRow}>
                <View style={styles.divisionLeft}>
                  <Ionicons name="person-outline" size={16} color="#888" style={{ marginRight: 8 }} />
                  <Text style={styles.divisionNombre}>{d.nombre}</Text>
                </View>
                <Text style={styles.divisionPct}>{d.porcentaje.toFixed(1)}%</Text>
                <Text style={styles.divisionImporte}>{d.importe.toFixed(2)} €</Text>
              </View>
            ))}
          </View>

          {/* Si tiene ticket asociado */}
          {gasto.ticket && (
            <View style={styles.seccion}>
              <Text style={styles.seccionTitle}>Ticket escaneado</Text>
              <Text style={styles.ticketInfo}>
                {gasto.ticket.comercio || 'Comercio desconocido'}
                {gasto.ticket.fecha ? ` · ${gasto.ticket.fecha}` : ''}
              </Text>
            </View>
          )}

          {/* Botón volver */}
          <TouchableOpacity style={styles.btnVolver} onPress={() => navigation.goBack()}>
            <Text style={styles.btnVolverText}>Volver</Text>
          </TouchableOpacity>

        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  header:         { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconoCategoria: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  title:          { fontSize: 20, fontWeight: 'bold', color: '#111' },
  categoria:      { fontSize: 13, color: '#888', marginTop: 2 },

  importeCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  importeLabel:  { fontSize: 13, color: '#666' },
  importeValor:  { fontSize: 36, fontWeight: 'bold', color: '#2563eb', marginVertical: 4 },
  importeMeta:   { fontSize: 13, color: '#888' },
  importeEmisor: { fontWeight: '700', color: '#333' },

  seccion:      { marginBottom: 20 },
  seccionTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 10 },
  modoBadge:    { fontSize: 14, color: '#555', backgroundColor: '#f0f0f0', padding: 8, borderRadius: 8, alignSelf: 'flex-start' },

  divisionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  divisionLeft:    { flex: 2, flexDirection: 'row', alignItems: 'center' },
  divisionNombre:  { fontSize: 15, color: '#333' },
  divisionPct:     { flex: 1, textAlign: 'center', fontSize: 13, color: '#888' },
  divisionImporte: { flex: 1, textAlign: 'right', fontSize: 15, fontWeight: '700', color: '#2563eb' },

  ticketInfo: { fontSize: 14, color: '#555', backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8 },

  btnVolver: {
    marginTop: 16, marginBottom: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  btnVolverText: { fontSize: 15, fontWeight: '600', color: '#333' },
});