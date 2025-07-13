import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';

export default function AgregarPersonasScreen({ route, navigation }) {
  const { lineas } = route.params; 
  const [nombre, setNombre] = useState('');
  const [personas, setPersonas] = useState([]);

  const agregarPersona = () => {
    if (nombre.trim() !== '') {
      setPersonas([...personas, nombre.trim()]);
      setNombre('');
    }
  };

  const continuar = () => {
    if (personas.length > 0) {
      navigation.navigate('AsignarProductosScreen', { lineas, personas });
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Introduce los nombres de las personas:</Text>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <TextInput
          style={{ borderWidth: 1, flex: 1, marginRight: 10, padding: 8 }}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre"
        />
        <Button title="Añadir" onPress={agregarPersona} />
      </View>
      <FlatList
        data={personas}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => <Text style={{ marginTop: 10 }}>{item}</Text>}
      />
      <Button title="Continuar" onPress={continuar} disabled={personas.length === 0} />
    </View>
  );
}
