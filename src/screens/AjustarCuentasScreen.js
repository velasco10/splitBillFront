import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';
import { useTheme } from '../utils/themeContext';

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
  const { theme } = useTheme();
  const pagos = simplificarPagos(saldos);
  const [seleccionados, setSeleccionados] = useState([]);
  const [guardando, setGuardando]         = useState(false);

  const toggleSeleccion = (index) => setSeleccionados(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  const seleccionarTodos = () => setSeleccionados(seleccionados.length === pagos.length ? [] : pagos.map((_, i) => i));

  const registrarPagos = async () => {
    setGuardando(true);
    try {
      await Promise.all(seleccionados.map(i => {
        const pago = pagos[i];
        return fetch(`${API_URL}/gastos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grupoId: grupo._id, concepto: `Ajuste: ${pago.de} → ${pago.a}`,
            categoria: 'ajuste', importe: pago.monto, emisor: pago.de,
            modo_division: 'manual',
            division: [{ nombre: pago.a, porcentaje: 100, importe: pago.monto }],
            fecha: new Date().toISOString().split('T')[0], ticket: null,
          }),
        });
      }));
      Alert.alert('¡Listo!', 'Pagos registrados correctamente', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron registrar los pagos');
    } finally {
      setGuardando(false);
    }
  };

  const totalPendiente     = pagos.reduce((acc, p) => acc + p.monto, 0).toFixed(2);
  const todosSeleccionados = seleccionados.length === pagos.length && pagos.length > 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <View style={[styles.container, { backgroundColor: theme.fondo }]}>
        <AppBackground>
          <Text style={[styles.title, { color: theme.texto }]}>Ajustar cuentas</Text>

          {pagos.length === 0 ? (
            <View style={styles.sinDeudas}>
              <Ionicons name="checkmark-circle-outline" size={64} color={theme.success} />
              <Text style={[styles.sinDeudasText, { color: theme.success }]}>¡Todo en paz!</Text>
              <Text style={[styles.sinDeudasSub, { color: theme.textoTerciario }]}>No hay deudas pendientes en el grupo</Text>
            </View>
          ) : (
            <>
              <View style={styles.resumen}>
                <Text style={[styles.resumenLabel, { color: theme.textoSecundario }]}>{pagos.length} pagos pendientes · Total:</Text>
                <Text style={[styles.resumenTotal, { color: theme.primaryDark }]}>{totalPendiente} €</Text>
              </View>

              <TouchableOpacity style={styles.seleccionarTodos} onPress={seleccionarTodos}>
                <Ionicons name={todosSeleccionados ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={theme.primary} />
                <Text style={[styles.seleccionarTodosText, { color: theme.primary }]}>
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
                      style={[
                        styles.card, { backgroundColor: theme.fondoCard },
                        seleccionado && { backgroundColor: theme.modo === 'oscuro' ? '#0f2a1a' : '#e8f5e9', borderWidth: 1, borderColor: theme.success }
                      ]}
                      onPress={() => toggleSeleccion(index)}
                    >
                      <View style={[styles.cardIcono, { backgroundColor: theme.primaryLight }]}>
                        <Ionicons name="cash-outline" size={22} color={theme.primary} />
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={[styles.cardTexto, { color: theme.textoSecundario }]}>
                          <Text style={[styles.nombre, { color: theme.texto }]}>{item.de}</Text>
                          {' paga a '}
                          <Text style={[styles.nombre, { color: theme.texto }]}>{item.a}</Text>
                        </Text>
                        <Text style={[styles.cardMonto, { color: theme.primaryDark }]}>{item.monto.toFixed(2)} €</Text>
                      </View>
                      <Ionicons name={seleccionado ? 'checkmark-circle' : 'ellipse-outline'} size={28} color={seleccionado ? theme.success : theme.borde} />
                    </TouchableOpacity>
                  );
                }}
              />

              <TouchableOpacity
                style={[styles.btnGuardar, { backgroundColor: theme.primary }, (seleccionados.length === 0 || guardando) && { backgroundColor: theme.primaryBorder }]}
                onPress={registrarPagos}
                disabled={seleccionados.length === 0 || guardando}
              >
                <Text style={styles.btnGuardarText}>
                  {guardando ? 'Guardando...' : `Registrar ${seleccionados.length > 0 ? seleccionados.length : ''} pago${seleccionados.length !== 1 ? 's' : ''}`}
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
  safeArea:  { flex: 1 },
  container: { flex: 1, padding: 20 },
  title:     { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  sinDeudas:     { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  sinDeudasText: { fontSize: 22, fontWeight: 'bold', marginTop: 16 },
  sinDeudasSub:  { fontSize: 14, marginTop: 8, textAlign: 'center' },
  resumen:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resumenLabel:  { fontSize: 13 },
  resumenTotal:  { fontSize: 16, fontWeight: '700' },
  seleccionarTodos:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  seleccionarTodosText: { fontSize: 14, fontWeight: '500' },
  card:       { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10, borderRadius: 12, elevation: 1, gap: 12 },
  cardIcono:  { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  cardInfo:   { flex: 1 },
  cardTexto:  { fontSize: 15 },
  cardMonto:  { fontSize: 18, fontWeight: '700', marginTop: 2 },
  nombre:     { fontWeight: 'bold' },
  btnGuardar:     { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16, marginBottom: 20 },
  btnGuardarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});