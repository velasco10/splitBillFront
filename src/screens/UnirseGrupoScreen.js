import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  Alert, TouchableOpacity, SafeAreaView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { guardarGrupoUnido } from '../utils/localGroups';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';

export default function UnirseGrupoScreen({ navigation }) {
  const [codigo, setCodigo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [preview, setPreview] = useState(null); // datos del grupo antes de unirse

  // Busca el grupo para mostrar preview antes de confirmar
  const buscarGrupo = async () => {
    const id = codigo.trim();
    if (!id) return;
    setCargando(true);
    setPreview(null);
    try {
      const res = await fetch(`${API_URL}/grupos/${id}`);
      if (!res.ok) throw new Error('Grupo no encontrado');
      const data = await res.json();
      setPreview(data);
    } catch (e) {
      Alert.alert('No encontrado', 'No existe ningún grupo con ese código. Revísalo e inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const confirmarUnirse = async () => {
  if (!preview) return;
  await guardarGrupoUnido(preview._id);
  Alert.alert('¡Unido!', `Te has unido a "${preview.nombre}"`, [
    { text: 'OK', onPress: () => navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    })}
  ]);
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppBackground>
          <Text style={styles.title}>Unirse a un grupo</Text>
          <Text style={styles.subtitle}>
            Pide el ID del grupo a quien lo creó y pégalo aquí.
          </Text>

          {/* Input código */}
          <Text style={styles.label}>Código del grupo</Text>
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Pega el ID del grupo..."
              placeholderTextColor="#6B7280"
              style={[styles.input, { flex: 1 }]}
              value={codigo}
              onChangeText={(v) => { setCodigo(v); setPreview(null); }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.btnBuscar, !codigo.trim() && styles.btnDesactivado]}
              onPress={buscarGrupo}
              disabled={!codigo.trim() || cargando}
            >
              {cargando
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="search-outline" size={20} color="#fff" />
              }
            </TouchableOpacity>
          </View>

          {/* Preview del grupo */}
          {preview && (
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Ionicons name="people-outline" size={28} color="#42a5f5" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.previewNombre}>{preview.nombre}</Text>
                  <Text style={styles.previewTipo}>
                    {preview.tipo === 'love' ? '👫 Pareja'
                      : preview.tipo === 'home' ? '🏠 Piso'
                      : '👥 Grupo'}
                    {' · '}{preview.miembros?.length || 0} miembros
                  </Text>
                </View>
              </View>

              {preview.miembros?.length > 0 && (
                <Text style={styles.previewMiembros}>
                  {preview.miembros.join(', ')}
                </Text>
              )}

              <TouchableOpacity style={styles.btnUnirse} onPress={confirmarUnirse}>
                <Text style={styles.btnUnirseText}>Unirme a este grupo</Text>
              </TouchableOpacity>
            </View>
          )}

        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title:     { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle:  { fontSize: 14, color: '#888', marginBottom: 24 },
  label:     { fontWeight: '600', fontSize: 15, color: '#333', marginBottom: 8 },

  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#42a5f5',
    paddingVertical: 6,
    fontSize: 16,
    color: '#111',
  },
  btnBuscar: {
    backgroundColor: '#42a5f5',
    width: 44, height: 44,
    borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  btnDesactivado: { backgroundColor: '#b0d4f1' },

  previewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  previewHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  previewNombre:  { fontSize: 18, fontWeight: '700', color: '#111' },
  previewTipo:    { fontSize: 13, color: '#888', marginTop: 2 },
  previewMiembros: { fontSize: 13, color: '#555', marginBottom: 16 },

  btnUnirse: {
    backgroundColor: '#42a5f5',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  btnUnirseText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});