import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet, SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppBackground from '../components/AppBackground';

export default function AgregarPersonasScreen({ route, navigation }) {
  const { lineas, grupo } = route.params;
  const [nombre, setNombre] = useState('');
  const [personas, setPersonas] = useState(
    grupo?.miembros ? [...grupo.miembros] : []
  );

  const volverAlHome = () => navigation.reset({
    index: 0,
    routes: [{ name: 'Home' }],
  });

  const agregarPersona = () => {
    const limpio = nombre.trim();
    if (!limpio) return;
    if (personas.includes(limpio)) {
      Alert.alert('Nombre repetido', `Ya añadiste a "${limpio}"`);
      return;
    }
    setPersonas([...personas, limpio]);
    setNombre('');
  };

  const eliminarPersona = (index) => {
    setPersonas(personas.filter((_, i) => i !== index));
  };

  const continuar = () => {
    if (personas.length > 0) {
      navigation.navigate('AsignarProductosScreen', { lineas, personas, grupo });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppBackground>

          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={26} color="#42a5f5" />
            </TouchableOpacity>
            <Text style={styles.title}>¿Quién participa?</Text>
            <TouchableOpacity onPress={volverAlHome}>
              <Ionicons name="home-outline" size={26} color="#42a5f5" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {grupo
              ? 'Los miembros del grupo están precargados. Puedes añadir o quitar personas.'
              : 'Añade las personas que participan en este ticket.'}
          </Text>

          {/* Input */}
          <View style={styles.row}>
            <TextInput
              placeholder="Nombre"
              placeholderTextColor="#6B7280"
              style={[styles.input, { flex: 1 }]}
              value={nombre}
              onChangeText={setNombre}
              returnKeyType="done"
              onSubmitEditing={agregarPersona}
              blurOnSubmit={false}
              autoCapitalize="words"
            />
            <TouchableOpacity onPress={agregarPersona} style={styles.iconBtn}>
              <Ionicons name="add-circle-outline" size={32} color="#42a5f5" />
            </TouchableOpacity>
          </View>

          {/* Lista personas */}
          <FlatList
            data={personas}
            keyExtractor={(item, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.miembroItem}>
                <Ionicons name="person-outline" size={18} color="#42a5f5" style={{ marginRight: 8 }} />
                <Text style={styles.miembroNombre}>{item}</Text>
                <TouchableOpacity onPress={() => eliminarPersona(index)}>
                  <Ionicons name="remove-circle-outline" size={26} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Añade al menos una persona para continuar</Text>
            }
          />

          {/* Botón continuar */}
          <TouchableOpacity
            style={[styles.btnContinuar, personas.length === 0 && styles.btnDesactivado]}
            onPress={continuar}
            disabled={personas.length === 0}
          >
            <Text style={styles.btnContinuarText}>Continuar</Text>
            <Ionicons name="arrow-forward-outline" size={18} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  title:    { fontSize: 20, fontWeight: 'bold', color: '#111' },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 20 },

  row:    { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBtn: { paddingHorizontal: 6 },
  input: {
    borderBottomWidth: 2, borderBottomColor: '#42a5f5',
    marginBottom: 16, paddingVertical: 6,
    fontSize: 16, backgroundColor: 'transparent', color: '#111',
  },

  miembroItem: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 8, padding: 10,
    backgroundColor: '#f8f9fa', borderRadius: 10,
  },
  miembroNombre: { flex: 1, fontSize: 15, color: '#333' },
  emptyText:     { textAlign: 'center', color: '#aaa', marginTop: 20, fontStyle: 'italic' },

  btnContinuar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#42a5f5', borderRadius: 12,
    padding: 16, marginTop: 24, marginBottom: 20,
  },
  btnDesactivado:   { backgroundColor: '#b0d4f1' },
  btnContinuarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});