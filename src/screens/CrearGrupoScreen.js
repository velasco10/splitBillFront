import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../config';
import { getDeviceId } from '../utils/deviceId';
import { guardarGrupoUnido } from '../utils/localGroups';
import AppBackground from '../components/AppBackground';

export default function CrearGrupoScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [miembroInput, setMiembroInput] = useState('');
  const [miembros, setMiembros] = useState([]);
  const [iconoSeleccionado, setIconoSeleccionado] = useState('default');
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
    const grupo = { nombre, miembros, creadorId: deviceId, icono: iconoSeleccionado };
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

  const iconosDisponibles = [
    { id: 'work', name: 'briefcase-outline', color: '#42a5f5' },
    { id: 'party', name: 'beer-outline', color: '#ab47bc' },
    { id: 'love', name: 'heart-outline', color: '#ef5350' },
    { id: 'friends', name: 'people-outline', color: '#26a69a' },
    { id: 'default', name: 'apps-outline', color: '#888' },
  ];


  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground>
        <ScrollView style={styles.container}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled">
          <Text style={{ marginBottom: 8, fontWeight: '500' }}>Elige un ícono:</Text>
          <FlatList
            data={iconosDisponibles}
            keyExtractor={(item) => item.id}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setIconoSeleccionado(item.id)}
                style={{
                  width: 50,
                  height: 50,
                  marginRight: 10,
                  borderRadius: 25,
                  backgroundColor: item.id === iconoSeleccionado ? '#d0e8ff' : '#eee',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: item.id === iconoSeleccionado ? 2 : 0,
                  borderColor: '#42a5f5',
                }}
              >
                <Ionicons name={item.name} size={24} color={item.color} />
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingVertical: 4 }}
            showsHorizontalScrollIndicator={false}
          />
          <TextInput
            placeholder="Nombre del grupo"
            placeholderTextColor="#6B7280"
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            underlineColorAndroid="transparent"
          />
          <View style={styles.row}>
            <TextInput
              placeholder="Añadir miembro"
              placeholderTextColor="#6B7280"
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
          {miembros.map((item, index) => (
            <View key={index} style={styles.miembroItem}>
              <Text>{item}</Text>
              <TouchableOpacity onPress={() => eliminarMiembro(index)}>
                <Ionicons name="remove-circle-outline" size={28} color="red" />
              </TouchableOpacity>
            </View>
          ))}

        </ScrollView>
      </AppBackground>

      {/* Botón flotante */}
      <TouchableOpacity
        onPress={crearGrupo}
        disabled={!nombre || miembros.length === 0}
        style={[
          styles.fab,
          (!nombre || miembros.length === 0) && styles.fabDisabled
        ]}
      >
        <Text style={styles.fabText}>Crear grupo</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  fabDisabled: {
  backgroundColor: '#ccc', // gris claro
},
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
    right: 30,
    bottom: 50, // ⬅️ más alto que antes (30), para no chocar con la barra
    backgroundColor: '#42a5f5',
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 20
  },

  fabText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
