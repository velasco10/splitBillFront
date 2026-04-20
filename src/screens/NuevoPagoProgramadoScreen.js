import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Menu, Provider } from 'react-native-paper';
import { API_URL } from '../config';
import { useAuth } from '../utils/authContext';
import AppBackground from '../components/AppBackground';
import { useTheme } from '../utils/themeContext';
import SelectorCategoria from '../components/SelectorCategoria';

export default function NuevoPagoProgramadoScreen({ route, navigation }) {
  const { grupo, pago } = route.params;
  const { token }  = useAuth();
  const { theme }  = useTheme();
  const miembros   = grupo.miembros || [];
  const editando   = !!pago;

  const [concepto, setConcepto]       = useState(pago?.concepto || '');
  const [categoria, setCategoria]     = useState(pago?.categoria || '');
  const [importe, setImporte]         = useState(pago?.importe?.toString() || '');
  const [diaMes, setDiaMes]           = useState(pago?.dia_mes?.toString() || '1');
  const [emisor, setEmisor]           = useState(pago?.emisor || miembros[0] || '');
  const [rota, setRota]               = useState(pago?.rota || false);
  const [division, setDivision]       = useState([]);
  const [bloqueados, setBloqueados]   = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [guardando, setGuardando]     = useState(false);

  useEffect(() => {
    if (pago?.division?.length) setDivision(pago.division);
    else inicializarDivision(importe);
  }, []);

  useEffect(() => { if (!pago?.division?.length) inicializarDivision(importe); }, [importe]);

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
    const nuevosBloqueados = bloqueados.includes(nombre) ? bloqueados : [...bloqueados, nombre];
    setBloqueados(nuevosBloqueados);
    const pctBloqueados = division.filter(d => nuevosBloqueados.includes(d.nombre) && d.nombre !== nombre).reduce((acc, d) => acc + d.porcentaje, 0);
    const libres     = division.filter(d => !nuevosBloqueados.includes(d.nombre));
    const parteResto = libres.length > 0 ? parseFloat(((100 - pct - pctBloqueados) / libres.length).toFixed(2)) : 0;
    setDivision(prev => prev.map(d => {
      if (d.nombre === nombre) return { ...d, porcentaje: pct, importe: parseFloat((total * pct / 100).toFixed(2)) };
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
      const body   = { grupoId: grupo._id, concepto, categoria: categoria || 'otros', importe: parseFloat(importe), dia_mes: parseInt(diaMes), emisor, rota, division, modo_division: 'manual', activo: true };
      const url    = editando ? `${API_URL}/pagos_programados/${pago._id}` : `${API_URL}/pagos_programados`;
      const method = editando ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Error al guardar'); }
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setGuardando(false); }
  };

  const puedeGuardar = concepto && importe && diaMes && emisor && division.length > 0;

  return (
    <Provider>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
        <ScrollView style={[styles.container, { backgroundColor: theme.fondo }]} keyboardShouldPersistTaps="handled">
          <AppBackground>

            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back-outline" size={26} color={theme.primary} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: theme.texto }]}>{editando ? 'Editar pago' : 'Nuevo pago programado'}</Text>
              <View style={{ width: 26 }} />
            </View>

            <Text style={[styles.label, { color: theme.texto }]}>Concepto</Text>
            <TextInput
              placeholder="Ej: Alquiler, Netflix, Luz..."
              placeholderTextColor={theme.textoTerciario}
              style={[styles.input, { borderBottomColor: theme.primary, color: theme.texto }]}
              value={concepto} onChangeText={setConcepto}
            />

            <Text style={[styles.label, { color: theme.texto }]}>
              Categoría <Text style={[styles.opcional, { color: theme.textoTerciario }]}>(opcional)</Text>
            </Text>
            <SelectorCategoria
              grupoId={grupo._id}
              value={categoria}
              onChange={setCategoria}
            />

            <Text style={[styles.label, { color: theme.texto }]}>Importe (€)</Text>
            <TextInput
              placeholder="0.00" placeholderTextColor={theme.textoTerciario}
              style={[styles.input, { borderBottomColor: theme.primary, color: theme.texto }]}
              value={importe} onChangeText={setImporte} keyboardType="decimal-pad"
            />

            <Text style={[styles.label, { color: theme.texto }]}>Día del mes</Text>
            <TextInput
              placeholder="1-28" placeholderTextColor={theme.textoTerciario}
              style={[styles.input, { borderBottomColor: theme.primary, color: theme.texto }]}
              value={diaMes} onChangeText={setDiaMes} keyboardType="number-pad" maxLength={2}
            />
            <Text style={[styles.inputHint, { color: theme.textoTerciario }]}>El gasto se mostrará para confirmar a partir de este día cada mes.</Text>

            <Text style={[styles.label, { color: theme.texto }]}>Pagado por</Text>
            <Menu
              visible={menuVisible} onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={[styles.dropdown, { borderBottomColor: theme.primary }]}>
                  <Text style={[styles.dropdownText, { color: theme.texto }]}>{emisor || 'Selecciona...'}</Text>
                  <Ionicons name="chevron-down-outline" size={18} color={theme.textoSecundario} />
                </TouchableOpacity>
              }
            >
              {miembros.map(m => <Menu.Item key={m} title={m} onPress={() => { setEmisor(m); setMenuVisible(false); }} />)}
            </Menu>

            <View style={[styles.switchRow, { backgroundColor: theme.fondoCard }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchLabel, { color: theme.texto }]}>El emisor rota cada mes</Text>
                <Text style={[styles.switchSub, { color: theme.textoSecundario }]}>Cada mes paga una persona diferente en orden</Text>
              </View>
              <Switch value={rota} onValueChange={setRota} trackColor={{ true: theme.primary }} />
            </View>

            <Text style={[styles.label, { color: theme.texto }]}>División</Text>
            <Text style={[styles.inputHint, { color: theme.textoTerciario }]}>Toca el porcentaje para ajustarlo. El resto se reparte automáticamente.</Text>
            <View style={[styles.divisionContainer, { backgroundColor: theme.fondoCard }]}>
              {division.map(d => (
                <View key={d.nombre} style={[styles.divisionRow, { borderBottomColor: theme.borde }, bloqueados.includes(d.nombre) && { backgroundColor: theme.primaryLight, borderRadius: 8 }]}>
                  <Text style={[styles.divisionNombre, { color: theme.texto }]}>{bloqueados.includes(d.nombre) ? '🔒 ' : ''}{d.nombre}</Text>
                  <View style={styles.divisionEditar}>
                    <TextInput style={[styles.pctInput, { borderBottomColor: theme.primary, color: theme.texto }]} value={d.porcentaje.toString()} onChangeText={v => actualizarPorcentaje(d.nombre, v)} keyboardType="decimal-pad" />
                    <Text style={[styles.pctSymbol, { color: theme.textoSecundario }]}>%</Text>
                  </View>
                  <Text style={[styles.divisionImporte, { color: theme.primaryDark }]}>{d.importe.toFixed(2)} €</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.btnGuardar, { backgroundColor: theme.primary }, (!puedeGuardar || guardando) && { backgroundColor: theme.primaryBorder }]}
              onPress={guardar} disabled={!puedeGuardar || guardando}
            >
              <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnGuardarText}>{guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear pago programado'}</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </AppBackground>
        </ScrollView>
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea:   { flex: 1 },
  container:  { flex: 1, padding: 20 },
  headerRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title:      { fontSize: 18, fontWeight: '700' },
  label:      { fontWeight: '600', marginTop: 14, marginBottom: 6, fontSize: 15 },
  opcional:   { fontWeight: '400', fontSize: 13 },
  input:      { borderBottomWidth: 2, marginBottom: 4, paddingVertical: 8, fontSize: 16 },
  inputHint:  { fontSize: 11, marginBottom: 8, fontStyle: 'italic' },
  dropdown:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 2, paddingVertical: 8, marginBottom: 4 },
  dropdownText:{ fontSize: 16 },
  switchRow:  { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 8, borderRadius: 12, padding: 14 },
  switchLabel:{ fontSize: 15, fontWeight: '600' },
  switchSub:  { fontSize: 12, marginTop: 2 },
  divisionContainer: { borderRadius: 12, padding: 12, marginTop: 4 },
  divisionRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  divisionNombre:    { flex: 2, fontSize: 15, fontWeight: '500' },
  divisionEditar:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  pctInput:          { borderBottomWidth: 1, width: 45, textAlign: 'center', fontSize: 15 },
  pctSymbol:         { marginLeft: 2 },
  divisionImporte:   { flex: 1, textAlign: 'right', fontWeight: '600' },
  btnGuardar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 16, marginTop: 24 },
  btnGuardarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});