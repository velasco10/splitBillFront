import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, SafeAreaView
} from 'react-native';
import { Menu, Provider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';
import { useAuth } from '../utils/authContext';

const MODOS = ['igualitario', 'plantilla', 'manual'];

export default function NuevoGastoScreen({ route, navigation }) {
  const { grupo } = route.params;
  const { usuario } = useAuth();
  const miembros  = grupo.miembros || [];
  const esPremium = usuario?.plan === 'premium';

  const [concepto, setConcepto]             = useState('');
  const [categoria, setCategoria]           = useState('');
  const [importe, setImporte]               = useState('');
  const [emisor, setEmisor]                 = useState(miembros[0] || '');
  const [modo, setModo]                     = useState('igualitario');
  const [division, setDivision]             = useState([]);
  const [bloqueados, setBloqueados]         = useState([]);
  const [menuVisible, setMenuVisible]       = useState(false);
  const [plantillaAplicada, setPlantillaAplicada] = useState(false);

  useEffect(() => {
    calcularDivision(modo, importe);
  }, [modo, importe]);

  useEffect(() => {
    if (categoria && modo === 'plantilla') {
      aplicarPlantilla(categoria);
    }
  }, [categoria, modo]);

  const calcularDivision = (modoActual, importeActual) => {
    setBloqueados([]);
    const total = parseFloat(importeActual) || 0;
    const parte = total > 0 ? parseFloat((total / miembros.length).toFixed(2)) : 0;
    const pct   = parseFloat((100 / miembros.length).toFixed(2));

    if (modoActual === 'igualitario') {
      setDivision(miembros.map(nombre => ({ nombre, porcentaje: pct, importe: parte })));
      return;
    }
    if (modoActual === 'manual') {
      setDivision(miembros.map(nombre => ({ nombre, porcentaje: pct, importe: parte })));
    }
  };

  const aplicarPlantilla = (cat) => {
    const plantilla = (grupo.plantillas || []).find(
      p => p.categoria.toLowerCase() === cat.toLowerCase()
    );
    if (!plantilla) {
      setPlantillaAplicada(false);
      return;
    }
    const total = parseFloat(importe) || 0;
    setDivision(plantilla.division.map(d => ({
      nombre: d.nombre,
      porcentaje: d.porcentaje,
      importe: parseFloat((total * d.porcentaje / 100).toFixed(2)),
    })));
    setPlantillaAplicada(true);
  };

  const actualizarPorcentajeManual = (nombre, valor) => {
    const pct   = parseFloat(valor) || 0;
    const total = parseFloat(importe) || 0;

    const nuevosBloqueados = bloqueados.includes(nombre)
      ? bloqueados : [...bloqueados, nombre];
    setBloqueados(nuevosBloqueados);

    const pctBloqueados = division
      .filter(d => nuevosBloqueados.includes(d.nombre) && d.nombre !== nombre)
      .reduce((acc, d) => acc + d.porcentaje, 0);

    const libres     = division.filter(d => !nuevosBloqueados.includes(d.nombre));
    const resto      = 100 - pct - pctBloqueados;
    const parteResto = libres.length > 0
      ? parseFloat((resto / libres.length).toFixed(2)) : 0;

    setDivision(prev => prev.map(d => {
      if (d.nombre === nombre)
        return { ...d, porcentaje: pct, importe: parseFloat((total * pct / 100).toFixed(2)) };
      if (nuevosBloqueados.includes(d.nombre)) return d;
      return { ...d, porcentaje: parteResto, importe: parseFloat((total * parteResto / 100).toFixed(2)) };
    }));
  };

  const handleSeleccionarModo = (m) => {
    if (m === 'plantilla' && !esPremium) {
      Alert.alert(
        '🔒 Función Premium',
        'Las plantillas de división están disponibles en el plan Premium.',
        [
          { text: 'Ahora no', style: 'cancel' },
          { text: 'Ver planes', onPress: () => navigation.navigate('Perfil') }
        ]
      );
      return;
    }
    setModo(m);
  };

  const guardarGasto = async () => {
    const gasto = {
      grupoId: grupo._id,
      concepto,
      categoria: categoria || 'otros',
      importe: parseFloat(importe),
      emisor,
      modo_division: modo,
      division,
      fecha: new Date().toISOString().split('T')[0],
      ticket: null,
    };
    try {
      const res = await fetch(`${API_URL}/gastos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gasto),
      });
      if (!res.ok) throw new Error('Error al guardar');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el gasto');
    }
  };

  const puedeGuardar = concepto && importe && emisor && division.length > 0;

  return (
    <Provider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
          <AppBackground>
            <Text style={styles.title}>Nuevo Gasto</Text>

            <Text style={styles.label}>Concepto</Text>
            <TextInput
              placeholder="Ej: Mercadona, Alquiler..."
              placeholderTextColor="#6B7280"
              style={styles.input}
              value={concepto}
              onChangeText={setConcepto}
            />

            <Text style={styles.label}>Categoría <Text style={styles.opcional}>(opcional)</Text></Text>
            <TextInput
              placeholder="Ej: alquiler, luz, alimentación..."
              placeholderTextColor="#6B7280"
              style={styles.input}
              value={categoria}
              onChangeText={setCategoria}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Importe (€)</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#6B7280"
              style={styles.input}
              value={importe}
              onChangeText={setImporte}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Pagado por</Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.dropdown}>
                  <Text style={styles.dropdownText}>{emisor || 'Selecciona...'}</Text>
                </TouchableOpacity>
              }
            >
              {miembros.map(m => (
                <Menu.Item key={m} title={m} onPress={() => { setEmisor(m); setMenuVisible(false); }} />
              ))}
            </Menu>

            <Text style={styles.label}>Modo de división</Text>
            <View style={styles.modoRow}>
              {MODOS.map(m => {
                const bloqueado = m === 'plantilla' && !esPremium;
                const activo    = modo === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.modoBtn,
                      activo    && styles.modoBtnActivo,
                      bloqueado && styles.modoBtnBloqueado,
                    ]}
                    onPress={() => handleSeleccionarModo(m)}
                  >
                    <View style={styles.modoBtnInner}>
                      <Text style={[styles.modoBtnText, activo && styles.modoBtnTextActivo]}>
                        {m === 'igualitario' ? '⚖️ Igual'
                          : m === 'plantilla' ? '📋 Plantilla'
                          : '✏️ Manual'}
                      </Text>
                      {bloqueado && (
                        <Ionicons name="lock-closed" size={11} color="#aaa" style={{ marginLeft: 3 }} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {modo === 'igualitario' && (
              <Text style={styles.modoInfo}>Se divide a partes iguales entre todos los miembros.</Text>
            )}
            {modo === 'plantilla' && (
              <Text style={styles.modoInfo}>
                {plantillaAplicada
                  ? '✅ Plantilla aplicada para esta categoría.'
                  : '⚠️ No hay plantilla para esta categoría. Escribe una o cambia el modo.'}
              </Text>
            )}
            {modo === 'manual' && (
              <Text style={styles.modoInfo}>
                Toca el porcentaje de una persona para ajustarlo. El resto se reparte automáticamente.
              </Text>
            )}

            {division.length > 0 && (
              <View style={styles.divisionContainer}>
                <Text style={styles.label}>División</Text>
                {division.map((d) => (
                  <View key={d.nombre} style={[
                    styles.divisionRow,
                    modo === 'manual' && bloqueados.includes(d.nombre) && styles.divisionRowBloqueada
                  ]}>
                    <Text style={styles.divisionNombre}>
                      {modo === 'manual' && bloqueados.includes(d.nombre) ? '🔒 ' : ''}{d.nombre}
                    </Text>
                    {modo === 'manual' ? (
                      <View style={styles.divisionEditar}>
                        <TextInput
                          style={styles.pctInput}
                          value={d.porcentaje.toString()}
                          onChangeText={(v) => actualizarPorcentajeManual(d.nombre, v)}
                          keyboardType="decimal-pad"
                        />
                        <Text style={styles.pctSymbol}>%</Text>
                      </View>
                    ) : (
                      <Text style={styles.divisionPct}>{d.porcentaje.toFixed(1)}%</Text>
                    )}
                    <Text style={styles.divisionImporte}>{d.importe.toFixed(2)} €</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.btnGuardar, !puedeGuardar && styles.btnDesactivado]}
              onPress={guardarGasto}
              disabled={!puedeGuardar}
            >
              <Text style={styles.btnGuardarText}>Guardar gasto</Text>
            </TouchableOpacity>

          </AppBackground>
        </ScrollView>
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea:   { flex: 1, backgroundColor: '#fff' },
  container:  { flex: 1, padding: 20, backgroundColor: '#fff' },
  title:      { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label:      { fontWeight: '600', marginTop: 14, marginBottom: 6, fontSize: 15, color: '#333' },
  opcional:   { fontWeight: '400', color: '#aaa', fontSize: 13 },

  input: {
    borderBottomWidth: 2, borderBottomColor: '#42a5f5',
    marginBottom: 4, paddingVertical: 6,
    fontSize: 16, backgroundColor: 'transparent', color: '#111',
  },
  dropdown:     { borderBottomWidth: 2, borderBottomColor: '#42a5f5', paddingVertical: 8, marginBottom: 4 },
  dropdownText: { fontSize: 16, color: '#111' },

  modoRow:           { flexDirection: 'row', gap: 8, marginBottom: 8 },
  modoBtn:           { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#f0f0f0', alignItems: 'center' },
  modoBtnActivo:     { backgroundColor: '#42a5f5' },
  modoBtnBloqueado:  { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0' },
  modoBtnInner:      { flexDirection: 'row', alignItems: 'center' },
  modoBtnText:       { fontSize: 12, color: '#555', fontWeight: '500' },
  modoBtnTextActivo: { color: '#fff' },
  modoInfo:          { fontSize: 12, color: '#888', marginBottom: 10, fontStyle: 'italic' },

  divisionContainer:    { marginTop: 8, backgroundColor: '#f8f9fa', borderRadius: 12, padding: 12 },
  divisionRow:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  divisionRowBloqueada: { backgroundColor: '#f0f4ff', borderRadius: 8 },
  divisionNombre:       { flex: 2, fontSize: 15, fontWeight: '500' },
  divisionPct:          { flex: 1, textAlign: 'center', color: '#666' },
  divisionImporte:      { flex: 1, textAlign: 'right', fontWeight: '600', color: '#2563eb' },
  divisionEditar:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  pctInput:             { borderBottomWidth: 1, borderBottomColor: '#42a5f5', width: 45, textAlign: 'center', fontSize: 15 },
  pctSymbol:            { marginLeft: 2, color: '#666' },

  btnGuardar:     { backgroundColor: '#42a5f5', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  btnDesactivado: { backgroundColor: '#b0d4f1' },
  btnGuardarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});