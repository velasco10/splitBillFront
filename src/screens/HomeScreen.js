import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, SafeAreaView, ActivityIndicator, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { salirDeGrupo, limpiarGruposInvalidos } from '../utils/localGroups';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';
import { useAuth } from '../utils/authContext';
import { useTheme, PALETAS } from '../utils/themeContext';

const ICONOS_GRUPO = {
  work:    { name: 'briefcase-outline', color: '#42a5f5' },
  party:   { name: 'beer-outline',      color: '#ab47bc' },
  love:    { name: 'heart-outline',     color: '#ef5350' },
  friends: { name: 'people-outline',    color: '#26a69a' },
  home:    { name: 'home-outline',      color: '#66bb6a' },
  travel:  { name: 'airplane-outline',  color: '#ff7043' },
  default: { name: 'apps-outline',      color: '#888'    },
};

const NOMBRES_PALETA = {
  azul:    'Azul',
  verde:   'Verde',
  morado:  'Morado',
  naranja: 'Naranja',
  rosa:    'Rosa',
};

export default function HomeScreen({ navigation }) {
  const { usuario }                                       = useAuth();
  const { theme, cambiarModo, cambiarPaleta, modo, paleta } = useTheme();
  const [grupos, setGrupos]                               = useState([]);
  const [loading, setLoading]                             = useState(true);
  const [opcionesVisibles, setOpcionesVisibles]           = useState(false);
  const [paletaVisible, setPaletaVisible]                 = useState(false);

  const cargarGrupos = async () => {
    setLoading(true);
    try {
      const ids = await limpiarGruposInvalidos();
      if (ids.length === 0) { setGrupos([]); return; }
      const response = await fetch(`${API_URL}/grupos/varios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (response.ok) setGrupos(await response.json());
    } catch (error) {
      console.error('Error cargando grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { cargarGrupos(); }, []));

  const confirmarSalir = (item) => {
    Alert.alert('Salir del grupo', `¿Seguro que quieres salir de "${item.nombre}"?`,
      [{ text: 'Cancelar', style: 'cancel' },
       { text: 'Salir', style: 'destructive', onPress: async () => { await salirDeGrupo(item._id); cargarGrupos(); } }]);
  };

  const renderGrupo = ({ item }) => {
    const icono = ICONOS_GRUPO[item.tipo] || ICONOS_GRUPO.default;
    return (
      <View style={[styles.grupoItem, { backgroundColor: theme.fondoCard, borderColor: theme.borde }]}>
        <TouchableOpacity
          style={styles.grupoTouch}
          onPress={() => navigation.navigate('DetalleGrupo', { grupoId: item._id })}
        >
          <Ionicons name={icono.name} size={22} color={icono.color} style={{ marginRight: 10 }} />
          <View>
            <Text style={[styles.nombreGrupo, { color: theme.texto }]}>{item.nombre}</Text>
            <Text style={[styles.subGrupo, { color: theme.textoSecundario }]}>
              {item.tipo === 'love'     ? '👫 Pareja'
                : item.tipo === 'work'   ? '💼 Trabajo'
                : item.tipo === 'party'  ? '🍺 Fiesta'
                : item.tipo === 'friends'? '👥 Amigos'
                : item.tipo === 'travel' ? '✈️ Viaje'
                : '🏠 Grupo'} · {item.miembros?.length || 0} miembros
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.salirBtn} onPress={() => confirmarSalir(item)}>
          <Ionicons name="exit-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <View style={[styles.container, { backgroundColor: theme.fondo }]}>
        <AppBackground>

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.texto }]}>Mis Grupos</Text>
            <View style={styles.headerRight}>

              {/* Botón modo claro/oscuro */}
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: theme.fondoCard }]}
                onPress={() => cambiarModo(modo === 'claro' ? 'oscuro' : 'claro')}
              >
                <Ionicons
                  name={modo === 'oscuro' ? 'sunny-outline' : 'moon-outline'}
                  size={18} color={theme.primary}
                />
              </TouchableOpacity>

              {/* Botón paleta de color */}
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: PALETAS[paleta].primary }]}
                onPress={() => setPaletaVisible(true)}
              >
                <Ionicons name="color-palette-outline" size={18} color="#fff" />
              </TouchableOpacity>

              {/* Perfil */}
              <TouchableOpacity
                style={styles.perfilBtn}
                onPress={() => navigation.navigate(usuario ? 'Perfil' : 'Login')}
              >
                <Ionicons
                  name={usuario ? 'person-circle-outline' : 'log-in-outline'}
                  size={28} color={theme.primary}
                />
                {!usuario && <Text style={[styles.loginText, { color: theme.primary }]}>Entrar</Text>}
              </TouchableOpacity>
            </View>
          </View>

          {/* Modal selector paleta */}
          <Modal
            visible={paletaVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setPaletaVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setPaletaVisible(false)}
            >
              <View style={[styles.paletaDropdown, { backgroundColor: theme.fondoCard }]}>
                <Text style={[styles.paletaTitle, { color: theme.texto }]}>Color de la app</Text>
                {Object.entries(PALETAS).map(([nombre, datos]) => (
                  <TouchableOpacity
                    key={nombre}
                    style={[styles.paletaOpcion, paleta === nombre && { backgroundColor: theme.primaryLight }]}
                    onPress={() => { cambiarPaleta(nombre); setPaletaVisible(false); }}
                  >
                    <View style={[styles.paletaCirculo, { backgroundColor: datos.primary }]} />
                    <Text style={[styles.paletaOpcionText, { color: theme.texto }]}>
                      {NOMBRES_PALETA[nombre]}
                    </Text>
                    {paleta === nombre && (
                      <Ionicons name="checkmark" size={18} color={theme.primary} style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loaderText, { color: theme.primary }]}>Cargando tus grupos...</Text>
            </View>
          ) : (
            <FlatList
              data={grupos}
              keyExtractor={(item) => item._id.toString()}
              renderItem={renderGrupo}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={48} color={theme.textoTerciario} />
                  <Text style={[styles.emptyText, { color: theme.textoSecundario }]}>No tienes grupos aún</Text>
                  <Text style={[styles.emptySubText, { color: theme.textoTerciario }]}>Crea uno o únete a uno existente</Text>
                </View>
              }
            />
          )}

          {/* FAB */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.primary }]}
            onPress={() => setOpcionesVisibles(!opcionesVisibles)}
          >
            <Ionicons name={opcionesVisibles ? 'close' : 'add'} size={32} color="white" />
          </TouchableOpacity>

          {opcionesVisibles && (
            <View style={[styles.fabOptions, { backgroundColor: theme.fondoCard }]}>
              <TouchableOpacity style={styles.fabOption} onPress={() => { setOpcionesVisibles(false); navigation.navigate('CrearGrupo'); }}>
                <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
                <Text style={[styles.fabOptionText, { color: theme.texto }]}>Crear grupo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fabOption} onPress={() => { setOpcionesVisibles(false); navigation.navigate('UnirseGrupo'); }}>
                <Ionicons name="enter-outline" size={20} color={theme.primary} />
                <Text style={[styles.fabOptionText, { color: theme.texto }]}>Unirse a grupo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fabOption} onPress={() => { setOpcionesVisibles(false); navigation.navigate('CamaraScreen'); }}>
                <Ionicons name="camera-outline" size={20} color={theme.primary} />
                <Text style={[styles.fabOptionText, { color: theme.texto }]}>Dividir cuenta</Text>
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

  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title:       { fontSize: 24, fontWeight: 'bold' },
  iconBtn:     { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  perfilBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  loginText:   { fontSize: 13, fontWeight: '600' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start', alignItems: 'flex-end',
    paddingTop: 100, paddingRight: 20,
  },
  paletaDropdown: {
    borderRadius: 14, padding: 12,
    minWidth: 180, elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8,
  },
  paletaTitle:      { fontSize: 13, fontWeight: '700', marginBottom: 10, paddingHorizontal: 8 },
  paletaOpcion:     { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 10, gap: 10 },
  paletaCirculo:    { width: 22, height: 22, borderRadius: 11 },
  paletaOpcionText: { fontSize: 14, fontWeight: '500' },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText:      { marginTop: 10 },
  emptyContainer:  { flex: 1, alignItems: 'center', marginTop: 60 },
  emptyText:       { fontSize: 16, marginTop: 12, fontWeight: '500' },
  emptySubText:    { fontSize: 13, marginTop: 4 },

  grupoItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2, borderWidth: 1 },
  grupoTouch:  { flexDirection: 'row', alignItems: 'center', flex: 1 },
  nombreGrupo: { fontSize: 16, fontWeight: '600' },
  subGrupo:    { fontSize: 12, marginTop: 2 },
  salirBtn:    { paddingHorizontal: 10 },

  fab: { position: 'absolute', right: 30, bottom: 50, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, zIndex: 20 },
  fabOptions: { position: 'absolute', right: 30, bottom: 120, borderRadius: 12, padding: 8, elevation: 6, zIndex: 30, minWidth: 200 },
  fabOption:     { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  fabOptionText: { fontSize: 15 },
});