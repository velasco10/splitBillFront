import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';

function simplificarPagos(saldos) {
  const positivos = [];
  const negativos = [];

  for (const persona in saldos) {
    const saldo = parseFloat(saldos[persona].toFixed(2));
    if (saldo > 0.01)  positivos.push({ persona, saldo });
    if (saldo < -0.01) negativos.push({ persona, saldo });
  }

  const pagos = [];
  while (positivos.length && negativos.length) {
    const acreedor = positivos[0];
    const deudor   = negativos[0];
    const monto    = Math.min(acreedor.saldo, -deudor.saldo);

    pagos.push({ de: deudor.persona, a: acreedor.persona, monto: parseFloat(monto.toFixed(2)) });

    acreedor.saldo -= monto;
    deudor.saldo   += monto;

    if (acreedor.saldo < 0.01) positivos.shift();
    if (deudor.saldo  > -0.01) negativos.shift();
  }
  return pagos;
}

export default function AjustarCuentasScreen({ route, navigation }) {
  const { grupo, saldos } = route.params;
  const pagos = simplificarPagos(saldos);
  const [seleccionados, setSeleccionados] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const toggleSeleccion = (index) => {
    setSeleccionados(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const seleccionarTodos = () => {
    if (seleccionados.length === pagos.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(pagos.map((_, i) => i));
    }
  };

  const registrarPagos = async () => {
    setGuardando(true);
    try {
      await Promise.all(seleccionados.map(i => {
        const pago = pagos[i];
        return fetch(`${API_URL}/gastos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grupoId: grupo._id,
            concepto: `Ajuste: ${pago.de} → ${pago.a}`,
            categoria: 'ajuste',
            importe: pago.monto,
            emisor: pago.de,
            modo_division: 'manual',
            division: [{ nombre: pago.a, porcentaje: 100, importe: pago.monto }],
            fecha: new Date().toISOString().split('T')[0],
            ticket: null,
          }),
        });
      }));

      Alert.alert('¡Listo!', 'Pagos registrados correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron registrar los pagos');
    } finally {
      setGuardando(false);
    }
  };

  const totalPendiente = pagos.reduce((acc, p) => acc + p.monto, 0).toFixed(2);
  const todosSeleccionados = seleccionados.length === pagos.length && pagos.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppBackground>
          <Text style={styles.title}>Ajustar cuentas</Text>

          {pagos.length === 0 ? (
            <View style={styles.sinDeudas}>
              <Ionicons name="checkmark-circle-outline" size={64} color="#2ecc71" />
              <Text style={styles.sinDeudasText}>¡Todo en paz!</Text>
              <Text style={styles.sinDeudasSub}>No hay deudas pendientes en el grupo</Text>
            </View>
          ) : (
            <>
              {/* Resumen */}
              <View style={styles.resumen}>
                <Text style={styles.resumenLabel}>{pagos.length} pagos pendientes · Total:</Text>
                <Text style={styles.resumenTotal}>{totalPendiente} €</Text>
              </View>

              {/* Seleccionar todos */}
              <TouchableOpacity style={styles.seleccionarTodos} onPress={seleccionarTodos}>
                <Ionicons
                  name={todosSeleccionados ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color="#42a5f5"
                />
                <Text style={styles.seleccionarTodosText}>
                  {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </Text>
              </TouchableOpacity>

              <FlatList
                data={pagos}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item, index }) => {
                  const seleccionado = seleccionados.includes(index);
                  return (
                    <TouchableOpacity
                      style={[styles.card, seleccionado && styles.cardSeleccionado]}
                      onPress={() => toggleSeleccion(index)}
                    >
                      <View style={styles.cardIcono}>
                        <Ionicons name="cash-outline" size={22} color="#42a5f5" />
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTexto}>
                          <Text style={styles.nombre}>{item.de}</Text>
                          {' paga a '}
                          <Text style={styles.nombre}>{item.a}</Text>
                        </Text>
                        <Text style={styles.cardMonto}>{item.monto.toFixed(2)} €</Text>
                      </View>
                      <Ionicons
                        name={seleccionado ? 'checkmark-circle' : 'ellipse-outline'}
                        size={28}
                        color={seleccionado ? '#2ecc71' : '#ccc'}
                      />
                    </TouchableOpacity>
                  );
                }}
              />

              {/* Botón guardar */}
              <TouchableOpacity
                style={[styles.btnGuardar, (seleccionados.length === 0 || guardando) && styles.btnDesactivado]}
                onPress={registrarPagos}
                disabled={seleccionados.length === 0 || guardando}
              >
                <Text style={styles.btnGuardarText}>
                  {guardando
                    ? 'Guardando...'
                    : `Registrar ${seleccionados.length > 0 ? seleccionados.length : ''} pago${seleccionados.length !== 1 ? 's' : ''}`}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title:     { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },

  sinDeudas:    { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  sinDeudasText: { fontSize: 22, fontWeight: 'bold', color: '#2ecc71', marginTop: 16 },
  sinDeudasSub:  { fontSize: 14, color: '#aaa', marginTop: 8, textAlign: 'center' },

  resumen:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resumenLabel: { fontSize: 13, color: '#888' },
  resumenTotal: { fontSize: 16, fontWeight: '700', color: '#2563eb' },

  seleccionarTodos:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  seleccionarTodosText: { fontSize: 14, color: '#42a5f5', fontWeight: '500' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 1,
    gap: 12,
  },
  cardSeleccionado: { backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#2ecc71' },
  cardIcono:  { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e3f2fd', justifyContent: 'center', alignItems: 'center' },
  cardInfo:   { flex: 1 },
  cardTexto:  { fontSize: 15, color: '#333' },
  cardMonto:  { fontSize: 18, fontWeight: '700', color: '#2563eb', marginTop: 2 },
  nombre:     { fontWeight: 'bold', color: '#111' },

  btnGuardar:     { backgroundColor: '#42a5f5', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16, marginBottom: 20 },
  btnDesactivado: { backgroundColor: '#b0d4f1' },
  btnGuardarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});