import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, SafeAreaView, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Menu, Provider } from 'react-native-paper';
import { API_URL } from '../config';
import { useAuth } from '../utils/authContext';
import AppBackground from '../components/AppBackground';

export default function NuevoPagoProgramadoScreen({ route, navigation }) {
  const { grupo, pago } = route.params; // pago existe si estamos editando
  const { token } = useAuth();
  const miembros  = grupo.miembros || [];
  const editando  = !!pago;

  const [concepto, setConcepto]     = useState(pago?.concepto     || '');
  const [categoria, setCategoria]   = useState(pago?.categoria    || '');
  const [importe, setImporte]       = useState(pago?.importe?.toString() || '');
  const [diaMes, setDiaMes]         = useState(pago?.dia_mes?.toString()  || '1');
  const [emisor, setEmisor]         = useState(pago?.emisor       || miembros[0] || '');
  const [rota, setRota]             = useState(pago?.rota         || false);
  const [division, setDivision]     = useState([]);
  const [bloqueados, setBloqueados] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [guardando, setGuardando]   = useState(false);

  useEffect(() => {
    if (pago?.division?.length) {
      setDivision(pago.division);
    } else {
      inicializarDivision(importe);
    }
  }, []);

  useEffect(() => {
    if (!pago?.division?.length) {
      inicializarDivision(importe);
    }
  }, [importe]);

  const inicializarDivision = (importeActual) => {
    setBloqueados([]);
    const total = parseFloat(importeActual) || 0;
    const pct   = parseFloat((100 / miembros.length).toFixed(2));
    const parte = total > 0 ? parseFloat((total / miembros.length).toFixed(2)) : 0;
    setDivision(miembros.map(nombre => ({ nombre, porcentaje: pct, importe: parte })));
  };

  const actualizarPorcentaje = (nombre, valor) => {
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

  const validar = () => {
    if (!concepto.trim()) { Alert.alert('Error', 'Introduce un concepto'); return false; }
    if (!importe || parseFloat(importe) <= 0) { Alert.alert('Error', 'Introduce un importe válido'); return false; }
    const dia = parseInt(diaMes);
    if (isNaN(dia) || dia < 1 || dia > 28) { Alert.alert('Error', 'El día debe ser entre 1 y 28'); return false; }
    if (!emisor) { Alert.alert('Error', 'Selecciona quién paga'); return false; }
    return true;
  };

  const guardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      const body = {
        grupoId:       grupo._id,
        concepto,
        categoria:     categoria || 'otros',
        importe:       parseFloat(importe),
        dia_mes:       parseInt(diaMes),
        emisor,
        rota,
        division,
        modo_division: 'manual',
        activo:        true,
      };

      const url    = editando
        ? `${API_URL}/pagos_programados/${pago._id}`
        : `${API_URL}/pagos_programados`;
      const method = editando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al guardar');
      }

      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setGuardando(false);
    }
  };

  const puedeGuardar = concepto && importe && diaMes && emisor && division.length > 0;

  return (
    <Provider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
          <AppBackground>

            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back-outline" size={26} color="#42a5f5" />
              </TouchableOpacity>
              <Text style={styles.title}>
                {editando ? 'Editar pago' : 'Nuevo pago programado'}
              </Text>
              <View style={{ width: 26 }} />
            </View>

            {/* Concepto */}
            <Text style={styles.label}>Concepto</Text>
            <TextInput
              placeholder="Ej: Alquiler, Netflix, Luz..."
              placeholderTextColor="#6B7280"
              style={styles.input}
              value={concepto}
              onChangeText={setConcepto}
            />

            {/* Categoría */}
            <Text style={styles.label}>
              Categoría <Text style={styles.opcional}>(opcional)</Text>
            </Text>
            <TextInput
              placeholder="Ej: alquiler, servicios..."
              placeholderTextColor="#6B7280"
              style={styles.input}
              value={categoria}
              onChangeText={setCategoria}
              autoCapitalize="none"
            />

            {/* Importe */}
            <Text style={styles.label}>Importe (€)</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#6B7280"
              style={styles.input}
              value={importe}
              onChangeText={setImporte}
              keyboardType="decimal-pad"
            />

            {/* Día del mes */}
            <Text style={styles.label}>Día del mes</Text>
            <TextInput
              placeholder="1-28"
              placeholderTextColor="#6B7280"
              style={styles.input}
              value={diaMes}
              onChangeText={setDiaMes}
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={styles.inputHint}>
              El gasto se mostrará para confirmar a partir de este día cada mes.
            </Text>

            {/* Emisor */}
            <Text style={styles.label}>Pagado por</Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setMenuVisible(true)}
                  style={styles.dropdown}
                >
                  <Text style={styles.dropdownText}>{emisor || 'Selecciona...'}</Text>
                  <Ionicons name="chevron-down-outline" size={18} color="#888" />
                </TouchableOpacity>
              }
            >
              {miembros.map(m => (
                <Menu.Item
                  key={m} title={m}
                  onPress={() => { setEmisor(m); setMenuVisible(false); }}
                />
              ))}
            </Menu>

            {/* Rota */}
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>El emisor rota cada mes</Text>
                <Text style={styles.switchSub}>
                  Cada mes paga una persona diferente en orden
                </Text>
              </View>
              <Switch
                value={rota}
                onValueChange={setRota}
                trackColor={{ true: '#42a5f5' }}
              />
            </View>

            {/* División */}
            <Text style={styles.label}>División</Text>
            <Text style={styles.inputHint}>
              Toca el porcentaje para ajustarlo. El resto se reparte automáticamente.
            </Text>
            <View style={styles.divisionContainer}>
              {division.map(d => (
                <View
                  key={d.nombre}
                  style={[
                    styles.divisionRow,
                    bloqueados.includes(d.nombre) && styles.divisionRowBloqueada
                  ]}
                >
                  <Text style={styles.divisionNombre}>
                    {bloqueados.includes(d.nombre) ? '🔒 ' : ''}{d.nombre}
                  </Text>
                  <View style={styles.divisionEditar}>
                    <TextInput
                      style={styles.pctInput}
                      value={d.porcentaje.toString()}
                      onChangeText={v => actualizarPorcentaje(d.nombre, v)}
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.pctSymbol}>%</Text>
                  </View>
                  <Text style={styles.divisionImporte}>{d.importe.toFixed(2)} €</Text>
                </View>
              ))}
            </View>

            {/* Botón guardar */}
            <TouchableOpacity
              style={[styles.btnGuardar, (!puedeGuardar || guardando) && styles.btnDesactivado]}
              onPress={guardar}
              disabled={!puedeGuardar || guardando}
            >
              <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnGuardarText}>
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear pago programado'}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />

          </AppBackground>
        </ScrollView>
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  title:    { fontSize: 18, fontWeight: '700', color: '#111' },
  label:    { fontWeight: '600', marginTop: 14, marginBottom: 6, fontSize: 15, color: '#333' },
  opcional: { fontWeight: '400', color: '#aaa', fontSize: 13 },

  input: {
    borderBottomWidth: 2, borderBottomColor: '#42a5f5',
    marginBottom: 4, paddingVertical: 8,
    fontSize: 16, color: '#111',
  },
  inputHint: { fontSize: 11, color: '#aaa', marginBottom: 8, fontStyle: 'italic' },

  dropdown: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2, borderBottomColor: '#42a5f5',
    paddingVertical: 8, marginBottom: 4,
  },
  dropdownText: { fontSize: 16, color: '#111' },

  switchRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 16, marginBottom: 8,
    backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14,
  },
  switchLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  switchSub:   { fontSize: 12, color: '#888', marginTop: 2 },

  divisionContainer:    { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 12, marginTop: 4 },
  divisionRow:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  divisionRowBloqueada: { backgroundColor: '#f0f4ff', borderRadius: 8 },
  divisionNombre:       { flex: 2, fontSize: 15, fontWeight: '500' },
  divisionEditar:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  pctInput:             { borderBottomWidth: 1, borderBottomColor: '#42a5f5', width: 45, textAlign: 'center', fontSize: 15 },
  pctSymbol:            { marginLeft: 2, color: '#666' },
  divisionImporte:      { flex: 1, textAlign: 'right', fontWeight: '600', color: '#2563eb' },

  btnGuardar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#42a5f5', borderRadius: 12,
    padding: 16, marginTop: 24,
  },
  btnDesactivado: { backgroundColor: '#b0d4f1' },
  btnGuardarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});