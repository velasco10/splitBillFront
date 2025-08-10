import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../config';
import { getDeviceId } from '../utils/deviceId';
import { guardarGrupoUnido } from '../utils/localGroups';

export default function CrearGrupoScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [miembroInput, setMiembroInput] = useState('');
  const [miembros, setMiembros] = useState([]);
  const insets = useSafeAreaInsets();

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
    console.log(API_URL)
    const deviceId = await getDeviceId();
    const grupo = { nombre, miembros, creadorId: deviceId };
    const res = await fetch(`${API_URL}/grupos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grupo),
    });
    const data = await res.json();
    const gid = data?._id || data?.id;
    if (!gid) {
      alert('No se pudo obtener el id del grupo');
      return;
    }
    await guardarGrupoUnido(gid);
    navigation.navigate('DetalleGrupo', { grupo: { ...data, _id: gid } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
        </View>

        {/* Botón flotante */}
        <TouchableOpacity
          onPress={crearGrupo}
          disabled={!nombre || miembros.length === 0}
          style={[
            styles.fab,
            { bottom: insets.bottom + 16, opacity: (!nombre || miembros.length === 0) ? 0.5 : 1 },
          ]}
        >
          <Text style={styles.fabText}>Crear grupo</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },
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
  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#42a5f5',
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});