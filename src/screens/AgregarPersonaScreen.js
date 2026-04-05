import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  Switch, Alert, TouchableOpacity, SafeAreaView
} from 'react-native';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';

export default function AgregarPersonaScreen({ route, navigation }) {
  const { grupo } = route.params;
  const [nombre, setNombre] = useState('');
  const [entrarEnGastos, setEntrarEnGastos] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const agregarPersona = async () => {
    const nombreLimpio = nombre.trim();

    // Validar duplicado en el front antes de llamar al back
    if (grupo.miembros?.includes(nombreLimpio)) {
      Alert.alert('Nombre repetido', `Ya existe un miembro llamado "${nombreLimpio}" en este grupo.`);
      return;
    }

    setGuardando(true);
    try {
      // Usamos el endpoint específico de miembros que ya valida duplicados en el back
      const res = await fetch(`${API_URL}/grupos/${grupo._id}/miembros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreLimpio }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al añadir');
      }

      // Si entra en gastos anteriores, recalculamos división de cada gasto
      if (entrarEnGastos) {
        const resGastos = await fetch(`${API_URL}/gastos/grupo/${grupo._id}`);
        const gastos = await resGastos.json();

        // Para cada gasto, añadimos al nuevo miembro con división igualitaria recalculada
        await Promise.all(gastos.map(async (gasto) => {
          if (gasto.modo_division !== 'igualitario') return; // Solo tocamos los igualitarios

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppBackground>
          <Text style={styles.title}>Añadir persona</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            placeholder="Nombre del nuevo miembro"
            placeholderTextColor="#6B7280"
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            returnKeyType="done"
          />

          {/* Miembros actuales */}
          {grupo.miembros?.length > 0 && (
            <View style={styles.miembrosActuales}>
              <Text style={styles.miembrosLabel}>Miembros actuales:</Text>
              <Text style={styles.miembrosTexto}>{grupo.miembros.join(', ')}</Text>
            </View>
          )}

          <View style={styles.switchRow}>
            <Switch
              value={entrarEnGastos}
              onValueChange={setEntrarEnGastos}
              trackColor={{ true: '#42a5f5' }}
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.switchLabel}>Sumar a gastos anteriores</Text>
              <Text style={styles.switchSub}>Solo afecta a gastos con división igualitaria</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btnGuardar, (!nombre.trim() || guardando) && styles.btnDesactivado]}
            onPress={agregarPersona}
            disabled={!nombre.trim() || guardando}
          >
            <Text style={styles.btnGuardarText}>
              {guardando ? 'Añadiendo...' : 'Añadir'}
            </Text>
          </TouchableOpacity>

        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title:     { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label:     { fontWeight: '600', fontSize: 15, color: '#333', marginBottom: 6 },

  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#42a5f5',
    marginBottom: 16,
    paddingVertical: 6,
    fontSize: 16,
    color: '#111',
  },

  miembrosActuales: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  miembrosLabel: { fontSize: 13, color: '#888', marginBottom: 4 },
  miembrosTexto: { fontSize: 14, color: '#333' },

  switchRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  switchLabel: { fontSize: 15, fontWeight: '500', color: '#333' },
  switchSub:   { fontSize: 12, color: '#aaa', marginTop: 2 },

  btnGuardar: {
    backgroundColor: '#42a5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  btnDesactivado: { backgroundColor: '#b0d4f1' },
  btnGuardarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});