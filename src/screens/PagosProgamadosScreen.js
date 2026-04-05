import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { API_URL } from '../config';
import { useAuth } from '../utils/authContext';
import AppBackground from '../components/AppBackground';

const MODOS_LABEL = {
  igualitario: '⚖️ Igualitario',
  plantilla:   '📋 Plantilla',
  manual:      '✏️ Manual',
};

export default function PagosProgramadosScreen({ route, navigation }) {
  const { grupo } = route.params;
  const { token } = useAuth();
  const [pagos, setPagos]     = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const fetchPagos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/pagos_programados/grupo/${grupo._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPagos(data);
      }
    } catch (e) {
      console.error('Error cargando pagos programados:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchPagos();
  }, [isFocused]);

  const eliminarPago = (pago) => {
    Alert.alert(
      'Eliminar pago programado',
      `¿Seguro que quieres eliminar "${pago.concepto}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_URL}/pagos_programados/${pago._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              fetchPagos();
            } catch (e) {
              Alert.alert('Error', 'No se pudo eliminar el pago');
            }
          }
        }
      ]
    );
  };

  const toggleActivo = async (pago) => {
    try {
      await fetch(`${API_URL}/pagos_programados/${pago._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activo: !pago.activo })
      });
      fetchPagos();
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el pago');
    }
  };

  const renderPago = ({ item }) => (
    <View style={[styles.pagoCard, !item.activo && styles.pagoCardInactivo]}>
      <View style={styles.pagoHeader}>
        <View style={styles.pagoIcono}>
          <Ionicons name="calendar-outline" size={22} color={item.activo ? '#42a5f5' : '#bbb'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pagoConcepto, !item.activo && { color: '#aaa' }]}>
            {item.concepto}
          </Text>
          <Text style={styles.pagoDia}>
            Día {item.dia_mes} de cada mes
          </Text>
        </View>
        <Text style={[styles.pagoImporte, !item.activo && { color: '#bbb' }]}>
          {item.importe.toFixed(2)} €
        </Text>
      </View>

      <View style={styles.pagoMeta}>
        <Text style={styles.pagoMetaText}>
          Paga: <Text style={{ fontWeight: '600' }}>{item.emisor}</Text>
          {item.rota ? ' (rota)' : ''}
        </Text>
        <Text style={styles.pagoMetaText}>
          {MODOS_LABEL[item.modo_division] || item.modo_division}
        </Text>
      </View>

      {/* División */}
      <View style={styles.divisionRow}>
        {item.division.map((d, i) => (
          <View key={i} style={styles.divisionChip}>
            <Text style={styles.divisionNombre}>{d.nombre}</Text>
            <Text style={styles.divisionPct}>{d.porcentaje.toFixed(0)}%</Text>
          </View>
        ))}
      </View>

      {/* Acciones */}
      <View style={styles.pagoAcciones}>
        <TouchableOpacity
          style={[styles.btnAccion, item.activo ? styles.btnPausar : styles.btnActivar]}
          onPress={() => toggleActivo(item)}
        >
          <Ionicons
            name={item.activo ? 'pause-circle-outline' : 'play-circle-outline'}
            size={16}
            color={item.activo ? '#f59e0b' : '#2ecc71'}
          />
          <Text style={[styles.btnAccionText, { color: item.activo ? '#f59e0b' : '#2ecc71' }]}>
            {item.activo ? 'Pausar' : 'Activar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnAccion, styles.btnEditar]}
          onPress={() => navigation.navigate('NuevoPagoProgramado', { grupo, pago: item })}
        >
          <Ionicons name="pencil-outline" size={16} color="#42a5f5" />
          <Text style={[styles.btnAccionText, { color: '#42a5f5' }]}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnAccion, styles.btnEliminar]}
          onPress={() => eliminarPago(item)}
        >
          <Ionicons name="trash-outline" size={16} color="#e74c3c" />
          <Text style={[styles.btnAccionText, { color: '#e74c3c' }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppBackground>

          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={26} color="#42a5f5" />
            </TouchableOpacity>
            <Text style={styles.title}>Pagos programados</Text>
            <View style={{ width: 26 }} />
          </View>

          <Text style={styles.subtitle}>
            Configura gastos recurrentes como el alquiler o facturas mensuales.
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#42a5f5" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={pagos}
              keyExtractor={item => item._id}
              renderItem={renderPago}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={56} color="#ccc" />
                  <Text style={styles.emptyText}>Sin pagos programados</Text>
                  <Text style={styles.emptySub}>
                    Añade gastos recurrentes para que se generen automáticamente cada mes.
                  </Text>
                </View>
              }
            />
          )}

          {/* FAB */}
          <TouchableOpacity
            style={styles.fab}
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
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 8,
  },
  title:    { fontSize: 18, fontWeight: '700', color: '#111' },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 20 },

  pagoCard: {
    backgroundColor: '#f8f9fa', borderRadius: 14,
    padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  pagoCardInactivo: { borderColor: '#f0f0f0', backgroundColor: '#fafafa' },

  pagoHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  pagoIcono:   { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  pagoConcepto: { fontSize: 15, fontWeight: '700', color: '#111' },
  pagoDia:      { fontSize: 12, color: '#888', marginTop: 2 },
  pagoImporte:  { fontSize: 18, fontWeight: '700', color: '#2563eb' },

  pagoMeta:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  pagoMetaText: { fontSize: 12, color: '#666' },

  divisionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  divisionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#e0e7ff', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  divisionNombre: { fontSize: 12, color: '#2563eb', fontWeight: '500' },
  divisionPct:    { fontSize: 11, color: '#2563eb' },

  pagoAcciones: { flexDirection: 'row', gap: 8 },
  btnAccion: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 4,
    paddingVertical: 8, borderRadius: 8, borderWidth: 1,
  },
  btnPausar:    { borderColor: '#fde68a', backgroundColor: '#fffbeb' },
  btnActivar:   { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' },
  btnEditar:    { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  btnEliminar:  { borderColor: '#fca5a5', backgroundColor: '#fff1f0' },
  btnAccionText: { fontSize: 12, fontWeight: '600' },

  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyText:      { fontSize: 16, fontWeight: '600', color: '#aaa', marginTop: 16 },
  emptySub:       { fontSize: 13, color: '#ccc', marginTop: 8, textAlign: 'center', lineHeight: 20 },

  fab: {
    position: 'absolute', right: 30, bottom: 50,
    backgroundColor: '#42a5f5', width: 60, height: 60,
    borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    elevation: 5, zIndex: 20,
  },
});