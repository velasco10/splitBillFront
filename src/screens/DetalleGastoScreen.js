import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppBackground from '../components/AppBackground';
import { useTheme } from '../utils/themeContext';

const CATEGORIA_ICONOS = {
  alquiler:     { icon: 'home-outline',           color: '#42a5f5' },
  luz:          { icon: 'flash-outline',           color: '#ffa726' },
  agua:         { icon: 'water-outline',           color: '#29b6f6' },
  internet:     { icon: 'wifi-outline',            color: '#66bb6a' },
  alimentacion: { icon: 'cart-outline',            color: '#ef5350' },
  limpieza:     { icon: 'sparkles-outline',        color: '#ab47bc' },
  ajuste:       { icon: 'swap-horizontal-outline', color: '#26a69a' },
  otros:        { icon: 'receipt-outline',         color: '#888'    },
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
  const { gasto }        = route.params;
  const { theme }        = useTheme();
  const { icon, color }  = getIcono(gasto.categoria);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <View style={[styles.container, { backgroundColor: theme.fondo }]}>
        <AppBackground>

          <View style={styles.header}>
            <View style={[styles.iconoCategoria, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon} size={28} color={color} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.title, { color: theme.texto }]}>{gasto.concepto}</Text>
              {gasto.categoria && <Text style={[styles.categoria, { color: theme.textoSecundario }]}>{gasto.categoria}</Text>}
            </View>
          </View>

          <View style={[styles.importeCard, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.importeLabel, { color: theme.textoSecundario }]}>Total</Text>
            <Text style={[styles.importeValor, { color: theme.primaryDark }]}>{gasto.importe.toFixed(2)} €</Text>
            <Text style={[styles.importeMeta, { color: theme.textoSecundario }]}>
              Pagado por <Text style={[styles.importeEmisor, { color: theme.texto }]}>{gasto.emisor}</Text>
              {gasto.fecha ? ` · ${gasto.fecha}` : ''}
            </Text>
          </View>

          <View style={styles.seccion}>
            <Text style={[styles.seccionTitle, { color: theme.texto }]}>Modo de división</Text>
            <Text style={[styles.modoBadge, { color: theme.textoSecundario, backgroundColor: theme.fondoCard }]}>
              {MODO_LABEL[gasto.modo_division] || gasto.modo_division}
            </Text>
          </View>

          <View style={styles.seccion}>
            <Text style={[styles.seccionTitle, { color: theme.texto }]}>Desglose por persona</Text>
            {(gasto.division || []).map((d, i) => (
              <View key={i} style={[styles.divisionRow, { borderBottomColor: theme.borde }]}>
                <View style={styles.divisionLeft}>
                  <Ionicons name="person-outline" size={16} color={theme.textoSecundario} style={{ marginRight: 8 }} />
                  <Text style={[styles.divisionNombre, { color: theme.texto }]}>{d.nombre}</Text>
                </View>
                <Text style={[styles.divisionPct, { color: theme.textoSecundario }]}>{d.porcentaje.toFixed(1)}%</Text>
                <Text style={[styles.divisionImporte, { color: theme.primaryDark }]}>{d.importe.toFixed(2)} €</Text>
              </View>
            ))}
          </View>

          {gasto.ticket && (
            <View style={styles.seccion}>
              <Text style={[styles.seccionTitle, { color: theme.texto }]}>Ticket escaneado</Text>
              <Text style={[styles.ticketInfo, { color: theme.textoSecundario, backgroundColor: theme.fondoCard }]}>
                {gasto.ticket.comercio || 'Comercio desconocido'}{gasto.ticket.fecha ? ` · ${gasto.ticket.fecha}` : ''}
              </Text>
            </View>
          )}

          <TouchableOpacity style={[styles.btnVolver, { backgroundColor: theme.fondoCard }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.btnVolverText, { color: theme.texto }]}>Volver</Text>
          </TouchableOpacity>

        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1 },
  container: { flex: 1, padding: 20 },
  header:         { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconoCategoria: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  title:          { fontSize: 20, fontWeight: 'bold' },
  categoria:      { fontSize: 13, marginTop: 2 },
  importeCard:    { borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 20 },
  importeLabel:   { fontSize: 13 },
  importeValor:   { fontSize: 36, fontWeight: 'bold', marginVertical: 4 },
  importeMeta:    { fontSize: 13 },
  importeEmisor:  { fontWeight: '700' },
  seccion:        { marginBottom: 20 },
  seccionTitle:   { fontSize: 15, fontWeight: '600', marginBottom: 10 },
  modoBadge:      { fontSize: 14, padding: 8, borderRadius: 8, alignSelf: 'flex-start' },
  divisionRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  divisionLeft:   { flex: 2, flexDirection: 'row', alignItems: 'center' },
  divisionNombre: { fontSize: 15 },
  divisionPct:    { flex: 1, textAlign: 'center', fontSize: 13 },
  divisionImporte:{ flex: 1, textAlign: 'right', fontSize: 15, fontWeight: '700' },
  ticketInfo:     { fontSize: 14, padding: 10, borderRadius: 8 },
  btnVolver:      { marginTop: 16, marginBottom: 30, borderRadius: 12, padding: 14, alignItems: 'center' },
  btnVolverText:  { fontSize: 15, fontWeight: '600' },
});