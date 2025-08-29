import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AppBackground from '../components/AppBackground';

const calcularTotales = (productos, personas) => {
  const totales = {};
  personas.forEach(nombre => totales[nombre] = 0);

  productos.forEach(producto => {
    if (producto.personas.length) {
      const importePorPersona = producto.importe / producto.personas.length;
      producto.personas.forEach(nombre => {
        totales[nombre] += importePorPersona;
      });
    }
  });
  return totales;
};

export default function TotalesPorPersona({ route }) {
  const { productos = [], personas = [] } = route.params || {};
  const totalesJson = calcularTotales(productos, personas);
  const data = Object.entries(totalesJson);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Totales por Persona</Text>
      <FlatList
        data={data}
        keyExtractor={([nombre]) => nombre}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.nombre}>{item[0]}</Text>
            <Text style={styles.total}>€{parseFloat(item[1]).toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#eee' },
  nombre: { fontSize: 18 },
  total: { fontSize: 18, fontWeight: 'bold', color: '#42a5f5' }
});
