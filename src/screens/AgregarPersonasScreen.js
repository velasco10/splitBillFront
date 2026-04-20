import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet, SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppBackground from '../components/AppBackground';
import { useTheme } from '../utils/themeContext';

export default function AgregarPersonasScreen({ route, navigation }) {
  const { lineas, grupo } = route.params;
  const { theme } = useTheme();
  const [nombre, setNombre]   = useState('');
  const [personas, setPersonas] = useState(grupo?.miembros ? [...grupo.miembros] : []);

  const volverAlHome = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  const agregarPersona = () => {
    const limpio = nombre.trim();
    if (!limpio) return;
    if (personas.includes(limpio)) { Alert.alert('Nombre repetido', `Ya añadiste a "${limpio}"`); return; }
    setPersonas([...personas, limpio]);
    setNombre('');
  };

  const eliminarPersona = (index) => setPersonas(personas.filter((_, i) => i !== index));

  const continuar = () => {
    if (personas.length > 0) navigation.navigate('AsignarProductosScreen', { lineas, personas, grupo });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <View style={[styles.container, { backgroundColor: theme.fondo }]}>
        <AppBackground>

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={26} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.texto }]}>¿Quién participa?</Text>
            <TouchableOpacity onPress={volverAlHome}>
              <Ionicons name="home-outline" size={26} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: theme.textoSecundario }]}>
            {grupo ? 'Los miembros del grupo están precargados. Puedes añadir o quitar personas.' : 'Añade las personas que participan en este ticket.'}
          </Text>

          <View style={styles.row}>
            <TextInput
              placeholder="Nombre"
              placeholderTextColor={theme.textoTerciario}
              style={[styles.input, { flex: 1, borderBottomColor: theme.primary, color: theme.texto }]}
              value={nombre}
              onChangeText={setNombre}
              returnKeyType="done"
              onSubmitEditing={agregarPersona}
              blurOnSubmit={false}
              autoCapitalize="words"
            />
            <TouchableOpacity onPress={agregarPersona} style={styles.iconBtn}>
              <Ionicons name="add-circle-outline" size={32} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={personas}
            keyExtractor={(item, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <View style={[styles.miembroItem, { backgroundColor: theme.fondoCard }]}>
                <Ionicons name="person-outline" size={18} color={theme.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.miembroNombre, { color: theme.texto }]}>{item}</Text>
                <TouchableOpacity onPress={() => eliminarPersona(index)}>
                  <Ionicons name="remove-circle-outline" size={26} color={theme.danger} />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.textoTerciario }]}>Añade al menos una persona para continuar</Text>
            }
          />

          <TouchableOpacity
            style={[styles.btnContinuar, { backgroundColor: theme.primary }, personas.length === 0 && { backgroundColor: theme.primaryBorder }]}
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
  safeArea:  { flex: 1 },
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title:     { fontSize: 20, fontWeight: 'bold' },
  subtitle:  { fontSize: 13, marginBottom: 20 },
  row:       { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBtn:   { paddingHorizontal: 6 },
  input:     { borderBottomWidth: 2, marginBottom: 16, paddingVertical: 6, fontSize: 16, backgroundColor: 'transparent' },
  miembroItem:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 10, borderRadius: 10 },
  miembroNombre: { flex: 1, fontSize: 15 },
  emptyText:     { textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  btnContinuar:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 16, marginTop: 24, marginBottom: 20 },
  btnContinuarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});