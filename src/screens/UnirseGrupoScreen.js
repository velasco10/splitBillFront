import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { guardarGrupoUnido } from '../utils/localGroups';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';
import { useTheme } from '../utils/themeContext';

export default function UnirseGrupoScreen({ navigation }) {
  const { theme }  = useTheme();
  const [codigo, setCodigo]   = useState('');
  const [cargando, setCargando] = useState(false);
  const [preview, setPreview] = useState(null);

  const buscarGrupo = async () => {
    const id = codigo.trim();
    if (!id) return;
    setCargando(true); setPreview(null);
    try {
      const res = await fetch(`${API_URL}/grupos/${id}`);
      if (!res.ok) throw new Error('Grupo no encontrado');
      setPreview(await res.json());
    } catch (e) { Alert.alert('No encontrado', 'No existe ningún grupo con ese código. Revísalo e inténtalo de nuevo.'); }
    finally { setCargando(false); }
  };

  const confirmarUnirse = async () => {
    if (!preview) return;
    await guardarGrupoUnido(preview._id);
    Alert.alert('¡Unido!', `Te has unido a "${preview.nombre}"`, [
      { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }) }
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <View style={[styles.container, { backgroundColor: theme.fondo }]}>
        <AppBackground>
          <Text style={[styles.title, { color: theme.texto }]}>Unirse a un grupo</Text>
          <Text style={[styles.subtitle, { color: theme.textoSecundario }]}>Pide el ID del grupo a quien lo creó y pégalo aquí.</Text>

          <Text style={[styles.label, { color: theme.texto }]}>Código del grupo</Text>
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Pega el ID del grupo..."
              placeholderTextColor={theme.textoTerciario}
              style={[styles.input, { flex: 1, borderBottomColor: theme.primary, color: theme.texto }]}
              value={codigo}
              onChangeText={v => { setCodigo(v); setPreview(null); }}
              autoCapitalize="none" autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.btnBuscar, { backgroundColor: theme.primary }, !codigo.trim() && { backgroundColor: theme.primaryBorder }]}
              onPress={buscarGrupo} disabled={!codigo.trim() || cargando}
            >
              {cargando ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="search-outline" size={20} color="#fff" />}
            </TouchableOpacity>
          </View>

          {preview && (
            <View style={[styles.previewCard, { backgroundColor: theme.fondoCard, borderColor: theme.primaryBorder }]}>
              <View style={styles.previewHeader}>
                <Ionicons name="people-outline" size={28} color={theme.primary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.previewNombre, { color: theme.texto }]}>{preview.nombre}</Text>
                  <Text style={[styles.previewTipo, { color: theme.textoSecundario }]}>
                    {preview.tipo === 'love' ? '👫 Pareja' : preview.tipo === 'home' ? '🏠 Piso' : '👥 Grupo'}
                    {' · '}{preview.miembros?.length || 0} miembros
                  </Text>
                </View>
              </View>
              {preview.miembros?.length > 0 && (
                <Text style={[styles.previewMiembros, { color: theme.textoSecundario }]}>{preview.miembros.join(', ')}</Text>
              )}
              <TouchableOpacity style={[styles.btnUnirse, { backgroundColor: theme.primary }]} onPress={confirmarUnirse}>
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
  safeArea:  { flex: 1 },
  container: { flex: 1, padding: 20 },
  title:     { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle:  { fontSize: 14, marginBottom: 24 },
  label:     { fontWeight: '600', fontSize: 15, marginBottom: 8 },
  inputRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  input:     { borderBottomWidth: 2, paddingVertical: 6, fontSize: 16 },
  btnBuscar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  previewCard:     { borderRadius: 14, padding: 16, borderWidth: 1 },
  previewHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  previewNombre:   { fontSize: 18, fontWeight: '700' },
  previewTipo:     { fontSize: 13, marginTop: 2 },
  previewMiembros: { fontSize: 13, marginBottom: 16 },
  btnUnirse:       { borderRadius: 12, padding: 14, alignItems: 'center' },
  btnUnirseText:   { color: '#fff', fontWeight: '700', fontSize: 15 },
});