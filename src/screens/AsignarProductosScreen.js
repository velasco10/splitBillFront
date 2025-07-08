import React, { useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';

export default function AsignarProductosScreen({ route, navigation }) {
  const { productos, personas } = route.params; // productos: [{nombre, precio}], personas: [nombres]
  const [consumo, setConsumo] = useState(
    productos.map(() => []) // array de arrays con nombres
  );

  // Añade/quita persona al producto
  const togglePersona = (prodIdx, persona) => {
    setConsumo(arr =>
      arr.map((c, i) =>
        i === prodIdx
          ? c.includes(persona)
            ? c.filter(p => p !== persona)
            : [...c, persona]
          : c
      )
    );
  };

  // Calcular totales al aceptar
  const calcularTotales = () => {
    const totales = {};
    personas.forEach(p => (totales[p] = 0));
    productos.forEach((prod, idx) => {
      const beneficiarios = consumo[idx];
      if (beneficiarios.length) {
        const parte = prod.precio / beneficiarios.length;
        beneficiarios.forEach(p => {
          totales[p] += parte;
        });
      }
    });
    navigation.navigate('TotalesPorPersona', { totales });
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={productos}
        keyExtractor={(_, idx) => idx + ''}
        renderItem={({ item, index }) => (
          <View style={{ marginBottom: 16, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.nombre} - €{item.precio}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {personas.map(p => (
                <TouchableOpacity
                  key={p}
                  style={{
                    padding: 8,
                    backgroundColor: consumo[index].includes(p) ? '#42a5f5' : '#eee',
                    borderRadius: 8,
                    margin: 4
                  }}
                  onPress={() => togglePersona(index, p)}
                >
                  <Text style={{ color: consumo[index].includes(p) ? 'white' : '#333' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      />
      <Button title="Aceptar" onPress={calcularTotales} />
    </View>
  );
}

export function TotalesPorPersona({ route }) {
  const { totales } = route.params;
  return (
    <View style={{ flex: 1, padding: 32 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Total por persona</Text>
      {Object.entries(totales).map(([nombre, total]) => (
        <Text key={nombre}>{nombre}: €{total.toFixed(2)}</Text>
      ))}
    </View>
  );
}
