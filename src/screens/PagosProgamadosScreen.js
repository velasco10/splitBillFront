import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { API_URL } from '../config';
import { useAuth } from '../utils/authContext';
import AppBackground from '../components/AppBackground';
import { useTheme } from '../utils/themeContext';

const MODOS_LABEL = {
  igualitario: '⚖️ Igualitario',
  plantilla:   '📋 Plantilla',
  manual:      '✏️ Manual',
};

export default function PagosProgramadosScreen({ route, navigation }) {
  const { grupo }  = route.params;
  const { token }  = useAuth();
  const { theme }  = useTheme();
  const [pagos, setPagos]     = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const fetchPagos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/pagos_programados/grupo/${grupo._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPagos(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isFocused) fetchPagos(); }, [isFocused]);

  const eliminarPago = (pago) => {
    Alert.alert('Eliminar pago programado', `¿Seguro que quieres eliminar "${pago.concepto}"?`,
      [{ text: 'Cancelar', style: 'cancel' },
       { text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await fetch(`${API_URL}/pagos_programados/${pago._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            fetchPagos();
          } catch (e) { Alert.alert('Error', 'No se pudo eliminar el pago'); }
        }}]);
  };

  const toggleActivo = async (pago) => {
    try {
      await fetch(`${API_URL}/pagos_programados/${pago._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ activo: !pago.activo })
      });
      fetchPagos();
    } catch (e) { Alert.alert('Error', 'No se pudo actualizar el pago'); }
  };

  const renderPago = ({ item }) => (
    <View style={[
      styles.pagoCard, { backgroundColor: theme.fondoCard, borderColor: theme.borde },
      !item.activo && { borderColor: theme.borde, backgroundColor: theme.modo === 'oscuro' ? '#111' : '#fafafa' }
    ]}>
      <View style={styles.pagoHeader}>
        <View style={[styles.pagoIcono, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="calendar-outline" size={22} color={item.activo ? theme.primary : theme.textoTerciario} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pagoConcepto, { color: theme.texto }, !item.activo && { color: theme.textoTerciario }]}>
            {item.concepto}
          </Text>
          <Text style={[styles.pagoDia, { color: theme.textoSecundario }]}>Día {item.dia_mes} de cada mes</Text>
        </View>
        <Text style={[styles.pagoImporte, { color: theme.primaryDark }, !item.activo && { color: theme.textoTerciario }]}>
          {item.importe.toFixed(2)} €
        </Text>
      </View>

      <View style={styles.pagoMeta}>
        <Text style={[styles.pagoMetaText, { color: theme.textoSecundario }]}>
          Paga: <Text style={{ fontWeight: '600', color: theme.texto }}>{item.emisor}</Text>{item.rota ? ' (rota)' : ''}
        </Text>
        <Text style={[styles.pagoMetaText, { color: theme.textoSecundario }]}>
          {MODOS_LABEL[item.modo_division] || item.modo_division}
        </Text>
      </View>

      <View style={styles.divisionRow}>
        {item.division.map((d, i) => (
          <View key={i} style={[styles.divisionChip, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.divisionNombre, { color: theme.primaryDark }]}>{d.nombre}</Text>
            <Text style={[styles.divisionPct, { color: theme.primaryDark }]}>{d.porcentaje.toFixed(0)}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.pagoAcciones}>
        <TouchableOpacity
          style={[styles.btnAccion, item.activo
            ? { borderColor: '#fde68a', backgroundColor: theme.modo === 'oscuro' ? '#1a1200' : '#fffbeb' }
            : { borderColor: '#bbf7d0', backgroundColor: theme.modo === 'oscuro' ? '#0a1a0a' : '#f0fdf4' }]}
          onPress={() => toggleActivo(item)}
        >
          <Ionicons name={item.activo ? 'pause-circle-outline' : 'play-circle-outline'} size={16} color={item.activo ? theme.warning : theme.success} />
          <Text style={[styles.btnAccionText, { color: item.activo ? theme.warning : theme.success }]}>
            {item.activo ? 'Pausar' : 'Activar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnAccion, { borderColor: theme.primaryBorder, backgroundColor: theme.primaryLight }]}
          onPress={() => navigation.navigate('NuevoPagoProgramado', { grupo, pago: item })}
        >
          <Ionicons name="pencil-outline" size={16} color={theme.primary} />
          <Text style={[styles.btnAccionText, { color: theme.primary }]}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnAccion, { borderColor: '#fca5a5', backgroundColor: theme.modo === 'oscuro' ? '#1a0a0a' : '#fff1f0' }]}
          onPress={() => eliminarPago(item)}
        >
          <Ionicons name="trash-outline" size={16} color={theme.danger} />
          <Text style={[styles.btnAccionText, { color: theme.danger }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <View style={[styles.container, { backgroundColor: theme.fondo }]}>
        <AppBackground>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={26} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.texto }]}>Pagos programados</Text>
            <View style={{ width: 26 }} />
          </View>

          <Text style={[styles.subtitle, { color: theme.textoSecundario }]}>
            Configura gastos recurrentes como el alquiler o facturas mensuales.
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={pagos}
              keyExtractor={item => item._id}
              renderItem={renderPago}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={56} color={theme.textoTerciario} />
                  <Text style={[styles.emptyText, { color: theme.textoTerciario }]}>Sin pagos programados</Text>
                  <Text style={[styles.emptySub, { color: theme.textoTerciario }]}>
                    Añade gastos recurrentes para que se generen automáticamente cada mes.
                  </Text>
                </View>
              }
            />
          )}

          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('NuevoPagoProgramado', { grupo })}
          >
            <Ionicons name="add" size={32} color="white" />
          </TouchableOpacity>
        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1 },
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title:     { fontSize: 18, fontWeight: '700' },
  subtitle:  { fontSize: 13, marginBottom: 20 },
  pagoCard:       { borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1 },
  pagoHeader:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  pagoIcono:      { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  pagoConcepto:   { fontSize: 15, fontWeight: '700' },
  pagoDia:        { fontSize: 12, marginTop: 2 },
  pagoImporte:    { fontSize: 18, fontWeight: '700' },
  pagoMeta:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  pagoMetaText:   { fontSize: 12 },
  divisionRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  divisionChip:   { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  divisionNombre: { fontSize: 12, fontWeight: '500' },
  divisionPct:    { fontSize: 11 },
  pagoAcciones:   { flexDirection: 'row', gap: 8 },
  btnAccion:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  btnAccionText:  { fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyText:      { fontSize: 16, fontWeight: '600', marginTop: 16 },
  emptySub:       { fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  fab: { position: 'absolute', right: 30, bottom: 50, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, zIndex: 20 },
});