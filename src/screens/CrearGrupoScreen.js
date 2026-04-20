import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../config';
import { getDeviceId } from '../utils/deviceId';
import { guardarGrupoUnido, limpiarGruposInvalidos } from '../utils/localGroups';
import AppBackground from '../components/AppBackground';
import { useAuth } from '../utils/authContext';
import { useTheme } from '../utils/themeContext';

const ICONOS = [
  { id: 'work',    name: 'briefcase-outline', color: '#42a5f5' },
  { id: 'travel',  name: 'airplane-outline',  color: '#ff7043' },
  { id: 'party',   name: 'beer-outline',      color: '#ab47bc' },
  { id: 'friends', name: 'people-outline',    color: '#26a69a' },
  { id: 'love',    name: 'heart-outline',     color: '#ef5350' },
  { id: 'default', name: 'apps-outline',      color: '#888'    },
];

const GRUPOS_FREE_MAX = 4;

export default function CrearGrupoScreen({ navigation }) {
  const { usuario }  = useAuth();
  const { theme }    = useTheme();
  const esPremium    = usuario?.plan === 'premium';

  const [nombre, setNombre]                       = useState('');
  const [miembroInput, setMiembroInput]           = useState('');
  const [miembros, setMiembros]                   = useState([]);
  const [iconoSeleccionado, setIconoSeleccionado] = useState('default');
  const [creando, setCreando]                     = useState(false);
  const [gruposActuales, setGruposActuales]       = useState(0);

  useEffect(() => { contarGrupos(); }, []);

  const contarGrupos = async () => {
    try {
      const ids = await limpiarGruposInvalidos();
      if (ids.length > 0) {
        const res = await fetch(`${API_URL}/grupos/varios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        if (res.ok) { setGruposActuales((await res.json()).length); return; }
      }
      setGruposActuales(ids.length);
    } catch (e) { console.error(e); }
  };

  const limiteAlcanzado = !esPremium && gruposActuales >= GRUPOS_FREE_MAX;

  const agregarMiembro = () => {
    const limpio = miembroInput.trim();
    if (!limpio) return;
    if (miembros.includes(limpio)) { Alert.alert('Nombre repetido', `Ya añadiste a "${limpio}"`); return; }
    setMiembros([...miembros, limpio]);
    setMiembroInput('');
  };

  const eliminarMiembro = (index) => setMiembros(miembros.filter((_, i) => i !== index));

  const crearGrupo = async () => {
    if (limiteAlcanzado) {
      Alert.alert('🔒 Límite alcanzado', `El plan gratuito permite un máximo de ${GRUPOS_FREE_MAX} grupos.`,
        [{ text: 'Cancelar', style: 'cancel' }, { text: 'Hazte Premium', onPress: () => navigation.navigate(usuario ? 'Perfil' : 'Login') }]);
      return;
    }
    setCreando(true);
    try {
      const deviceId = await getDeviceId();
      const res = await fetch(`${API_URL}/grupos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, tipo: iconoSeleccionado, miembros, creadorId: deviceId, plantillas: [] }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Error al crear el grupo'); }
      const data = await res.json();
      const gid  = data?._id || data?.id;
      if (!gid) throw new Error('No se pudo obtener el ID del grupo');
      await guardarGrupoUnido(gid);
      navigation.navigate('DetalleGrupo', { grupoId: gid });
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo crear el grupo');
    } finally {
      setCreando(false);
    }
  };

  const puedeCrear = nombre.trim() && miembros.length > 0 && !creando;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.fondo }]}>
      <AppBackground>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: theme.texto }]}>Crear grupo</Text>

          {!esPremium && (
            <TouchableOpacity
              style={[styles.limiteBanner, { backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder }, limiteAlcanzado && { backgroundColor: theme.modo === 'oscuro' ? '#1a0a0a' : '#fff1f0', borderColor: '#fca5a5' }]}
              onPress={() => limiteAlcanzado && navigation.navigate(usuario ? 'Perfil' : 'Login')}
            >
              <Ionicons name={limiteAlcanzado ? 'lock-closed-outline' : 'information-circle-outline'} size={16} color={limiteAlcanzado ? theme.danger : theme.primaryDark} style={{ marginRight: 6 }} />
              <Text style={[styles.limiteBannerText, { color: limiteAlcanzado ? theme.danger : theme.primaryDark }]}>
                {limiteAlcanzado ? `Has alcanzado el límite de ${GRUPOS_FREE_MAX} grupos.` : `${gruposActuales} de ${GRUPOS_FREE_MAX} grupos usados en el plan gratuito.`}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.label, { color: theme.texto }]}>Nombre del grupo</Text>
          <TextInput
            placeholder="Ej: Piso Centro, Casa Familia..."
            placeholderTextColor={theme.textoTerciario}
            style={[styles.input, { borderBottomColor: theme.primary, color: theme.texto }, limiteAlcanzado && { borderBottomColor: theme.borde, color: theme.textoTerciario }]}
            value={nombre}
            onChangeText={setNombre}
            editable={!limiteAlcanzado}
          />

          <Text style={[styles.label, { color: theme.texto }]}>Ícono</Text>
          <FlatList
            data={ICONOS}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => !limiteAlcanzado && setIconoSeleccionado(item.id)}
                style={[
                  styles.iconoBtn, { backgroundColor: theme.fondoCard },
                  iconoSeleccionado === item.id && { backgroundColor: theme.primaryLight, borderWidth: 2, borderColor: theme.primary },
                  limiteAlcanzado && { opacity: 0.4 }
                ]}
              >
                <Ionicons name={item.name} size={24} color={item.color} />
              </TouchableOpacity>
            )}
            contentContainerStyle={{ gap: 10, paddingVertical: 4, marginBottom: 16 }}
          />

          <Text style={[styles.label, { color: theme.texto }]}>Miembros</Text>
          <View style={styles.row}>
            <TextInput
              placeholder="Nombre del miembro"
              placeholderTextColor={theme.textoTerciario}
              style={[styles.input, { flex: 1, marginBottom: 0, borderBottomColor: theme.primary, color: theme.texto }, limiteAlcanzado && { borderBottomColor: theme.borde, color: theme.textoTerciario }]}
              value={miembroInput}
              onChangeText={setMiembroInput}
              returnKeyType="done"
              onSubmitEditing={agregarMiembro}
              blurOnSubmit={false}
              editable={!limiteAlcanzado}
            />
            <TouchableOpacity onPress={agregarMiembro} style={styles.addBtn} disabled={limiteAlcanzado}>
              <Ionicons name="add-circle-outline" size={32} color={limiteAlcanzado ? theme.borde : theme.primary} />
            </TouchableOpacity>
          </View>

          {miembros.length === 0 && !limiteAlcanzado && <Text style={[styles.miembrosHint, { color: theme.textoTerciario }]}>Añade al menos un miembro para continuar</Text>}

          {miembros.map((item, index) => (
            <View key={index} style={[styles.miembroItem, { backgroundColor: theme.fondoCard }]}>
              <Ionicons name="person-outline" size={18} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.miembroNombre, { color: theme.texto }]}>{item}</Text>
              <TouchableOpacity onPress={() => eliminarMiembro(index)}>
                <Ionicons name="remove-circle-outline" size={26} color={theme.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </AppBackground>

      <TouchableOpacity
        onPress={crearGrupo}
        disabled={!puedeCrear || limiteAlcanzado}
        style={[styles.fab, { backgroundColor: theme.primary }, (!puedeCrear || limiteAlcanzado) && { backgroundColor: theme.primaryBorder }]}
      >
        <Text style={styles.fabText}>{creando ? 'Creando...' : limiteAlcanzado ? 'Límite alcanzado' : 'Crear grupo'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1 },
  container: { flex: 1, padding: 20 },
  title:     { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label:     { fontWeight: '600', fontSize: 15, marginBottom: 8, marginTop: 12 },
  limiteBanner:     { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1 },
  limiteBannerText: { flex: 1, fontSize: 13 },
  input:       { borderBottomWidth: 2, marginBottom: 16, paddingVertical: 6, fontSize: 16, backgroundColor: 'transparent' },
  iconoBtn:    { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  row:         { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  addBtn:      { paddingHorizontal: 6 },
  miembrosHint:  { fontSize: 12, marginBottom: 12, fontStyle: 'italic' },
  miembroItem:   { flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 8, borderRadius: 10 },
  miembroNombre: { flex: 1, fontSize: 15 },
  fab:        { position: 'absolute', right: 30, bottom: 50, height: 48, paddingHorizontal: 24, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 5, zIndex: 20 },
  fabText:    { color: '#fff', fontWeight: '700', fontSize: 16 },
});