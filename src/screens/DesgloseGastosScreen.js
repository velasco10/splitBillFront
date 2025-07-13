import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { API_URL } from '@env';

export default function DesgloseGastosScreen({ route, navigation }) {
  const { grupo } = route.params;
  const [gastos, setGastos] = useState([]);

  useEffect(() => {
    async function fetchGastos() {
      const res = await fetch(`${API_URL}/gastos/grupo/${grupo._id}`);
      const data = await res.json();
      setGastos(data);
    }
    fetchGastos();
  }, [grupo._id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Desglose de gastos</Text>
      <View style={styles.headerRow}>
        <Text style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}>Concepto</Text>
        <Text style={[styles.cell, { flex: 1, fontWeight: 'bold', textAlign: 'right' }]}>Importe (€)</Text>
        <Text style={[styles.cell, { flex: 1, fontWeight: 'bold', textAlign: 'right' }]}>Pagó</Text>
      </View>
      <FlatList
        data={gastos}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('DetalleGasto', { gasto: item })}
          >
            <Text style={[styles.cell, { flex: 2 }]}>{item.concepto}</Text>
            <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>{item.importe}</Text>
            <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>{item.emisor}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ marginTop: 16 }}>Sin gastos registrados.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  headerRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#aaa', paddingBottom: 6, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 8,
    alignItems: 'center',
  },
  cell: { fontSize: 15 },
});
