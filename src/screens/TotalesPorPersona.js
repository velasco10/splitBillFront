import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';
import { useTheme } from '../utils/themeContext';

const calcularTotales = (productos, personas) => {
  const totales = {};
  personas.forEach(nombre => totales[nombre] = 0);
  productos.forEach(producto => {
    if (producto.personas?.length) {
      const importePorPersona = producto.importe / producto.personas.length;
      producto.personas.forEach(nombre => { totales[nombre] = (totales[nombre] || 0) + importePorPersona; });
    }
  });
  return totales;
};

export default function TotalesPorPersonaScreen({ route, navigation }) {
  const { productos = [], personas = [], grupo } = route.params || {};
  const { theme }    = useTheme();
  const totalesMap   = calcularTotales(productos, personas);
  const data         = Object.entries(totalesMap).map(([nombre, total]) => ({ nombre, total }));
  const totalGeneral = data.reduce((acc, d) => acc + d.total, 0);
  const [guardando, setGuardando] = useState(false);

  const buildDivision = () => data.map(d => ({
    nombre: d.nombre,
    porcentaje: parseFloat(((d.total / totalGeneral) * 100).toFixed(2)),
    importe: parseFloat(d.total.toFixed(2)),
  }));

  const volverAlHome = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  const guardarComoGasto = async () => {
    if (!grupo) { Alert.alert('Sin grupo', 'No se puede guardar el gasto sin un grupo asociado.'); return; }
    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/gastos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grupoId: grupo._id, concepto: 'Ticket escaneado', categoria: 'alimentacion',
          importe: parseFloat(totalGeneral.toFixed(2)), emisor: personas[0],
          modo_division: 'manual', division: buildDivision(),
          fecha: new Date().toISOString().split('T')[0], ticket: { productos },
        }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      Alert.alert('¡Guardado!', 'El gasto del ticket se ha registrado en el grupo.', [
        { text: 'OK', onPress: () => navigation.navigate('DetalleGrupo', { grupoId: grupo._id }) }
      ]);
    } catch (e) { Alert.alert('Error', 'No se pudo guardar el gasto'); }
    finally { setGuardando(false); }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <View style={[styles.container, { backgroundColor: theme.fondo }]}>
        <AppBackground>

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={26} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.texto }]}>Totales por persona</Text>
            <TouchableOpacity onPress={volverAlHome}>
              <Ionicons name="home-outline" size={26} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.resumenCard, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.resumenLabel, { color: theme.textoSecundario }]}>Total del ticket</Text>
            <Text style={[styles.resumenTotal, { color: theme.primaryDark }]}>{totalGeneral.toFixed(2)} €</Text>
            <Text style={[styles.resumenSub, { color: theme.textoTerciario }]}>{productos.length} productos · {personas.length} personas</Text>
          </View>

          <FlatList
            data={data}
            keyExtractor={({ nombre }) => nombre}
            renderItem={({ item }) => {
              const pct = totalGeneral > 0 ? ((item.total / totalGeneral) * 100).toFixed(1) : 0;
              return (
                <View style={[styles.item, { borderColor: theme.borde }]}>
                  <View style={styles.itemLeft}>
                    <Ionicons name="person-outline" size={18} color={theme.primary} style={{ marginRight: 10 }} />
                    <View>
                      <Text style={[styles.nombre, { color: theme.texto }]}>{item.nombre}</Text>
                      <Text style={[styles.pct, { color: theme.textoTerciario }]}>{pct}% del total</Text>
                    </View>
                  </View>
                  <Text style={[styles.total, { color: theme.primary }]}>{item.total.toFixed(2)} €</Text>
                </View>
              );
            }}
            ListEmptyComponent={<Text style={[styles.empty, { color: theme.textoTerciario }]}>No hay datos que mostrar</Text>}
          />

          <Text style={[styles.seccionTitle, { color: theme.texto }]}>Productos</Text>
          {productos.map((p, i) => (
            <View key={i} style={[styles.productoRow, { borderColor: theme.borde }]}>
              <Text style={[styles.productoNombre, { color: theme.texto }]} numberOfLines={1}>{p.producto}</Text>
              <Text style={[styles.productoPersonas, { color: theme.textoSecundario }]}>{p.personas?.join(', ') || 'Sin asignar'}</Text>
              <Text style={[styles.productoImporte, { color: theme.primaryDark }]}>{p.importe.toFixed(2)} €</Text>
            </View>
          ))}

          {grupo && (
            <TouchableOpacity
              style={[styles.btnGuardar, { backgroundColor: theme.primary }, guardando && { backgroundColor: theme.primaryBorder }]}
              onPress={guardarComoGasto} disabled={guardando}
            >
              <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnGuardarText}>{guardando ? 'Guardando...' : 'Guardar en grupo'}</Text>
            </TouchableOpacity>
          )}

        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1 },
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title:     { fontSize: 20, fontWeight: 'bold' },
  resumenCard:  { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 20 },
  resumenLabel: { fontSize: 13 },
  resumenTotal: { fontSize: 32, fontWeight: 'bold', marginVertical: 4 },
  resumenSub:   { fontSize: 12 },
  item:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  itemLeft:     { flexDirection: 'row', alignItems: 'center' },
  nombre:       { fontSize: 16, fontWeight: '600' },
  pct:          { fontSize: 12, marginTop: 2 },
  total:        { fontSize: 18, fontWeight: 'bold' },
  empty:        { textAlign: 'center', marginTop: 20 },
  seccionTitle: { fontSize: 15, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  productoRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, gap: 8 },
  productoNombre:   { flex: 2, fontSize: 13 },
  productoPersonas: { flex: 2, fontSize: 12 },
  productoImporte:  { flex: 1, textAlign: 'right', fontSize: 13, fontWeight: '600' },
  btnGuardar:     { borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 40 },
  btnGuardarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});