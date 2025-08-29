import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet } from 'react-native';
import AppBackground from '../components/AppBackground';

export default function AsignarProductosScreen({ route, navigation }) {
  // Recibe los productos y personas por params
  const { lineas, personas } = route.params; // lineas = productos del ticket

  // Estado: qué personas están asignadas a cada producto
  const [asignaciones, setAsignaciones] = useState(
    lineas.map(() => []) // Inicializa cada producto con array vacío
  );

  // Cambia la asignación al tocar un nombre
  const togglePersona = (prodIdx, persona) => {
    setAsignaciones(prev => prev.map((arr, i) =>
      i === prodIdx
        ? arr.includes(persona)
          ? arr.filter(p => p !== persona)
          : [...arr, persona]
        : arr
    ));
  };

  const handleAceptar = () => {
    // Envía los productos con personas asignadas
    const resultado = lineas.map((prod, i) => ({
      ...prod,
      personas: asignaciones[i],
    }));
    navigation.navigate('TotalesPorPersona', { productos: resultado, personas });
  };

  return (
    <View style={styles.container}>
      <AppBackground>
        <FlatList
          data={lineas}
          keyExtractor={(item, idx) => `${item.producto}-${idx}`}
          renderItem={({ item, index }) => (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.producto} ({item.importe}€)</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {personas.map(persona => (
                  <TouchableOpacity
                    key={persona}
                    style={{
                      margin: 5,
                      padding: 8,
                      borderRadius: 20,
                      backgroundColor: asignaciones[index].includes(persona) ? '#4caf50' : '#e0e0e0'
                    }}
                    onPress={() => togglePersona(index, persona)}
                  >
                    <Text>{persona}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        />
        <Button title="Aceptar" onPress={handleAceptar} />
      </AppBackground>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 }
});
