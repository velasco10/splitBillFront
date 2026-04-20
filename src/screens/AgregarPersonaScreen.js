import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  Switch, Alert, TouchableOpacity, SafeAreaView
} from 'react-native';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';
import { useTheme } from '../utils/themeContext';

export default function AgregarPersonaScreen({ route, navigation }) {
  const { grupo } = route.params;
  const { theme } = useTheme();
  const [nombre, setNombre]               = useState('');
  const [entrarEnGastos, setEntrarEnGastos] = useState(false);
  const [guardando, setGuardando]         = useState(false);

  const agregarPersona = async () => {
    const nombreLimpio = nombre.trim();
    if (grupo.miembros?.includes(nombreLimpio)) {
      Alert.alert('Nombre repetido', `Ya existe un miembro llamado "${nombreLimpio}" en este grupo.`);
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/grupos/${grupo._id}/miembros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreLimpio }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al añadir');
      }
      if (entrarEnGastos) {
        const resGastos = await fetch(`${API_URL}/gastos/grupo/${grupo._id}`);
        const gastos = await resGastos.json();
        await Promise.all(gastos.map(async (gasto) => {
          if (gasto.modo_division !== 'igualitario') return;
          const miembrosActualizados = [...(gasto.division.map(d => d.nombre)), nombreLimpio];
          const parte = parseFloat((gasto.importe / miembrosActualizados.length).toFixed(2));
          const nuevaDivision = miembrosActualizados.map(n => ({
            nombre: n,
            porcentaje: parseFloat((100 / miembrosActualizados.length).toFixed(2)),
            importe: parte,
          }));
          await fetch(`${API_URL}/gastos/${gasto._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ division: nuevaDivision }),
          });
        }));
      }
      Alert.alert('¡Listo!', `${nombreLimpio} añadido correctamente`);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo añadir la persona');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <View style={[styles.container, { backgroundColor: theme.fondo }]}>
        <AppBackground>
          <Text style={[styles.title, { color: theme.texto }]}>Añadir persona</Text>

          <Text style={[styles.label, { color: theme.texto }]}>Nombre</Text>
          <TextInput
            placeholder="Nombre del nuevo miembro"
            placeholderTextColor={theme.textoTerciario}
            style={[styles.input, { borderBottomColor: theme.primary, color: theme.texto }]}
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            returnKeyType="done"
          />

          {grupo.miembros?.length > 0 && (
            <View style={[styles.miembrosActuales, { backgroundColor: theme.fondoCard }]}>
              <Text style={[styles.miembrosLabel, { color: theme.textoSecundario }]}>Miembros actuales:</Text>
              <Text style={[styles.miembrosTexto, { color: theme.texto }]}>{grupo.miembros.join(', ')}</Text>
            </View>
          )}

          <View style={styles.switchRow}>
            <Switch
              value={entrarEnGastos}
              onValueChange={setEntrarEnGastos}
              trackColor={{ true: theme.primary }}
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.switchLabel, { color: theme.texto }]}>Sumar a gastos anteriores</Text>
              <Text style={[styles.switchSub, { color: theme.textoTerciario }]}>Solo afecta a gastos con división igualitaria</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btnGuardar, { backgroundColor: theme.primary }, (!nombre.trim() || guardando) && { backgroundColor: theme.primaryBorder }]}
            onPress={agregarPersona}
            disabled={!nombre.trim() || guardando}
          >
            <Text style={styles.btnGuardarText}>{guardando ? 'Añadiendo...' : 'Añadir'}</Text>
          </TouchableOpacity>
        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1 },
  container: { flex: 1, padding: 20 },
  title:     { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label:     { fontWeight: '600', fontSize: 15, marginBottom: 6 },
  input:     { borderBottomWidth: 2, marginBottom: 16, paddingVertical: 6, fontSize: 16 },
  miembrosActuales: { borderRadius: 10, padding: 12, marginBottom: 16 },
  miembrosLabel:    { fontSize: 13, marginBottom: 4 },
  miembrosTexto:    { fontSize: 14 },
  switchRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  switchLabel: { fontSize: 15, fontWeight: '500' },
  switchSub:   { fontSize: 12, marginTop: 2 },
  btnGuardar:     { borderRadius: 12, padding: 16, alignItems: 'center' },
  btnGuardarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});