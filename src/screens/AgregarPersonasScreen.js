import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

  const eliminarPersona = (index) => {
    setPersonas(personas.filter((_, i) => i !== index));
  };

  const continuar = () => {
    if (personas.length > 0) {
      navigation.navigate('AsignarProductosScreen', { lineas, personas });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Introduce los nombres de las personas:</Text>
      <View style={styles.row}>
        <TextInput
          placeholder="Nombre"
          style={[styles.input, { flex: 1 }]}
          value={nombre}
          onChangeText={setNombre}
          returnKeyType="done"
          onSubmitEditing={agregarPersona}
          blurOnSubmit={false}
        />
        <TouchableOpacity onPress={agregarPersona} style={styles.iconBtn}>
          <Ionicons name="add-circle-outline" size={32} color="#42a5f5" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={personas}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.miembroItem}>
            <Text>{item}</Text>
            <TouchableOpacity onPress={() => eliminarPersona(index)}>
              <Ionicons name="remove-circle-outline" size={28} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
      <Button title="Continuar" onPress={continuar} disabled={personas.length === 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#42a5f5',
    marginBottom: 16,
    paddingVertical: 6,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBtn: { paddingHorizontal: 6 },
  miembroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
});
