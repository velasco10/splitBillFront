import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DetalleGastoScreen({ route }) {
  const { gasto } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{gasto.concepto}</Text>
      <Text>Importe: {gasto.importe} €</Text>
      <Text>Pagó: {gasto.emisor}</Text>
      <Text>Beneficiarios:</Text>
      {gasto.beneficiarios.map((b, i) => <Text key={i}>- {b}</Text>)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
});
