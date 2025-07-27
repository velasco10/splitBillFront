import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import { getDeviceId } from '../utils/deviceId';

export default function CrearGrupoScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [miembroInput, setMiembroInput] = useState('');
  const [miembros, setMiembros] = useState([]);

  const agregarMiembro = () => {
    if (miembroInput.trim()) {
      setMiembros([...miembros, miembroInput.trim()]);
      setMiembroInput('');
    }
  };

  const eliminarMiembro = (index) => {
    setMiembros(miembros.filter((_, i) => i !== index));
  };

  const crearGrupo = async () => {
    const deviceId = await getDeviceId();
    const grupo = { nombre, miembros, creadorId: deviceId };
    const res = await fetch(`${API_URL}/grupos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grupo),
    });
    const data = await res.json();
    navigation.navigate('DetalleGrupo', { grupo: data });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Grupo</Text>
      <TextInput
        placeholder="Nombre del grupo"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        underlineColorAndroid="transparent"
      />
      <View style={styles.row}>
        <TextInput
          placeholder="Añadir miembro"
          style={[styles.input, { flex: 1 }]}
          value={miembroInput}
          onChangeText={setMiembroInput}
          underlineColorAndroid="transparent"
          returnKeyType="done"
          onSubmitEditing={agregarMiembro}
          blurOnSubmit={false}
        />
        <TouchableOpacity onPress={agregarMiembro} style={styles.iconBtn}>
          <Ionicons name="add-circle-outline" size={32} color="#42a5f5" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={miembros}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.miembroItem}>
            <Text>{item}</Text>
            <TouchableOpacity onPress={() => eliminarMiembro(index)}>
              <Ionicons name="remove-circle-outline" size={28} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
      <Button title="Crear grupo" onPress={crearGrupo} disabled={!nombre || miembros.length === 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#42a5f5',
    marginBottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 0,
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
