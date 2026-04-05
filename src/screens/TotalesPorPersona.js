import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  SafeAreaView, TouchableOpacity, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';

const calcularTotales = (productos, personas) => {
  const totales = {};
  personas.forEach(nombre => totales[nombre] = 0);

  productos.forEach(producto => {
    if (producto.personas?.length) {
      const importePorPersona = producto.importe / producto.personas.length;
      producto.personas.forEach(nombre => {
        totales[nombre] = (totales[nombre] || 0) + importePorPersona;
      });
    }
  });
  return totales;
};

export default function TotalesPorPersonaScreen({ route, navigation }) {
  const { productos = [], personas = [], grupo } = route.params || {};
  const totalesMap = calcularTotales(productos, personas);
  const data = Object.entries(totalesMap).map(([nombre, total]) => ({ nombre, total }));
  const totalGeneral = data.reduce((acc, d) => acc + d.total, 0);
  const [guardando, setGuardando] = useState(false);

  const buildDivision = () => {
    return data.map(d => ({
      nombre: d.nombre,
      porcentaje: parseFloat(((d.total / totalGeneral) * 100).toFixed(2)),
      importe: parseFloat(d.total.toFixed(2)),
    }));
  };

  const volverAlHome = () => navigation.reset({
    index: 0,
    routes: [{ name: 'Home' }],
  });

  const guardarComoGasto = async () => {
    if (!grupo) {
      Alert.alert('Sin grupo', 'No se puede guardar el gasto sin un grupo asociado.');
      return;
    }
    setGuardando(true);
    try {
      const division = buildDivision();
      const gasto = {
        grupoId: grupo._id,
        concepto: 'Ticket escaneado',
        categoria: 'alimentacion',
        importe: parseFloat(totalGeneral.toFixed(2)),
        emisor: personas[0],
        modo_division: 'manual',
        division,
        fecha: new Date().toISOString().split('T')[0],
        ticket: { productos },
      };

      const res = await fetch(`${API_URL}/gastos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gasto),
      });

      if (!res.ok) throw new Error('Error al guardar');

      Alert.alert('¡Guardado!', 'El gasto del ticket se ha registrado en el grupo.', [
        { text: 'OK', onPress: () => navigation.navigate('DetalleGrupo', { grupoId: grupo._id }) }
      ]);
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el gasto');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppBackground>

          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={26} color="#42a5f5" />
            </TouchableOpacity>
            <Text style={styles.title}>Totales por persona</Text>
            <TouchableOpacity onPress={volverAlHome}>
              <Ionicons name="home-outline" size={26} color="#42a5f5" />
            </TouchableOpacity>
          </View>

          {/* Resumen ticket */}
          <View style={styles.resumenCard}>
            <Text style={styles.resumenLabel}>Total del ticket</Text>
            <Text style={styles.resumenTotal}>{totalGeneral.toFixed(2)} €</Text>
            <Text style={styles.resumenSub}>{productos.length} productos · {personas.length} personas</Text>
          </View>

          {/* Lista por persona */}
          <FlatList
            data={data}
            keyExtractor={({ nombre }) => nombre}
            renderItem={({ item }) => {
              const pct = totalGeneral > 0 ? ((item.total / totalGeneral) * 100).toFixed(1) : 0;
              return (
                <View style={styles.item}>
                  <View style={styles.itemLeft}>
                    <Ionicons name="person-outline" size={18} color="#42a5f5" style={{ marginRight: 10 }} />
                    <View>
                      <Text style={styles.nombre}>{item.nombre}</Text>
                      <Text style={styles.pct}>{pct}% del total</Text>
                    </View>
                  </View>
                  <Text style={styles.total}>{item.total.toFixed(2)} €</Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>No hay datos que mostrar</Text>
            }
          />

          {/* Desglose de productos */}
          <Text style={styles.seccionTitle}>Productos</Text>
          {productos.map((p, i) => (
            <View key={i} style={styles.productoRow}>
              <Text style={styles.productoNombre} numberOfLines={1}>{p.producto}</Text>
              <Text style={styles.productoPersonas}>
                {p.personas?.join(', ') || 'Sin asignar'}
              </Text>
              <Text style={styles.productoImporte}>{p.importe.toFixed(2)} €</Text>
            </View>
          ))}

          {/* Botón guardar */}
          {grupo && (
            <TouchableOpacity
              style={[styles.btnGuardar, guardando && styles.btnDesactivado]}
              onPress={guardarComoGasto}
              disabled={guardando}
            >
              <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnGuardarText}>
                {guardando ? 'Guardando...' : 'Guardar en grupo'}
              </Text>
            </TouchableOpacity>
          )}

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
    justifyContent: 'space-between', marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111' },

  resumenCard: {
    backgroundColor: '#eff6ff', borderRadius: 14,
    padding: 16, alignItems: 'center', marginBottom: 20,
  },
  resumenLabel: { fontSize: 13, color: '#666' },
  resumenTotal: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', marginVertical: 4 },
  resumenSub:   { fontSize: 12, color: '#888' },

  item: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderColor: '#f0f0f0',
  },
  itemLeft:  { flexDirection: 'row', alignItems: 'center' },
  nombre:    { fontSize: 16, fontWeight: '600', color: '#111' },
  pct:       { fontSize: 12, color: '#aaa', marginTop: 2 },
  total:     { fontSize: 18, fontWeight: 'bold', color: '#42a5f5' },
  empty:     { textAlign: 'center', color: '#aaa', marginTop: 20 },

  seccionTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 20, marginBottom: 10 },
  productoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f0f0f0',
    gap: 8,
  },
  productoNombre:   { flex: 2, fontSize: 13, color: '#333' },
  productoPersonas: { flex: 2, fontSize: 12, color: '#888' },
  productoImporte:  { flex: 1, textAlign: 'right', fontSize: 13, fontWeight: '600', color: '#2563eb' },

  btnGuardar: {
    backgroundColor: '#42a5f5', borderRadius: 12,
    padding: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 24, marginBottom: 40,
  },
  btnDesactivado: { backgroundColor: '#b0d4f1' },
  btnGuardarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});