import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { API_URL } from '../config';
import { useAuth } from '../utils/authContext';
import AppBackground from '../components/AppBackground';
import { useTheme } from '../utils/themeContext';
import SelectorCategoria, { getIconoCategoria } from '../components/SelectorCategoria';

export default function PresupuestoScreen({ route, navigation }) {
  const { grupo }  = route.params;
  const { token }  = useAuth();
  const { theme }  = useTheme();
  const isFocused  = useIsFocused();

  const [estado, setEstado]           = useState(null);
  const [editando, setEditando]       = useState(false);
  const [loading, setLoading]         = useState(true);
  const [guardando, setGuardando]     = useState(false);
  const [categorias, setCategorias]   = useState([]);
  const [nuevaCat, setNuevaCat]       = useState('');
  const [nuevoLimite, setNuevoLimite] = useState('');

  useEffect(() => { if (isFocused) fetchEstado(); }, [isFocused]);

  const fetchEstado = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/presupuestos/grupo/${grupo._id}/estado`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEstado(data);
        if (data?.categorias) setCategorias(data.categorias.map(c => ({ nombre: c.nombre, limite: c.limite.toString() })));
      } else { setEstado(null); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const agregarCategoria = () => {
    const nombre = nuevaCat.trim().toLowerCase();
    if (!nombre) { Alert.alert('Error', 'Selecciona o escribe una categoría'); return; }
    if (!nuevoLimite || parseFloat(nuevoLimite) <= 0) { Alert.alert('Error', 'Introduce un límite válido'); return; }
    if (categorias.find(c => c.nombre === nombre)) { Alert.alert('Repetida', 'Ya existe esa categoría en el presupuesto'); return; }
    setCategorias([...categorias, { nombre, limite: nuevoLimite }]);
    setNuevaCat('');
    setNuevoLimite('');
  };

  const eliminarCategoria = (nombre) => setCategorias(categorias.filter(c => c.nombre !== nombre));
  const actualizarLimite  = (nombre, valor) => setCategorias(categorias.map(c => c.nombre === nombre ? { ...c, limite: valor } : c));

  const guardar = async () => {
    if (categorias.length === 0) { Alert.alert('Error', 'Añade al menos una categoría'); return; }
    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/presupuestos/grupo/${grupo._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ categorias: categorias.map(c => ({ nombre: c.nombre, limite: parseFloat(c.limite) })) })
      });
      if (!res.ok) throw new Error('Error al guardar');
      setEditando(false); fetchEstado();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setGuardando(false); }
  };

  const eliminarPresupuesto = () => {
    Alert.alert('Eliminar presupuesto', '¿Seguro que quieres eliminar el presupuesto de este grupo?',
      [{ text: 'Cancelar', style: 'cancel' },
       { text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await fetch(`${API_URL}/presupuestos/grupo/${grupo._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            setEstado(null); setCategorias([]);
          } catch (e) { Alert.alert('Error', 'No se pudo eliminar'); }
        }}]);
  };

  // Iconos usando el mismo helper que SelectorCategoria
  const getIcono = (cat) => {
    const datos = getIconoCategoria(cat);
    return { icon: datos.icon, color: datos.color };
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <ScrollView style={[styles.container, { backgroundColor: theme.fondo }]} keyboardShouldPersistTaps="handled">
        <AppBackground>

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={26} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.texto }]}>Presupuesto mensual</Text>
            {estado && !editando && (
              <TouchableOpacity onPress={() => setEditando(true)}>
                <Ionicons name="pencil-outline" size={22} color={theme.primary} />
              </TouchableOpacity>
            )}
            {!estado && !editando && (
              <TouchableOpacity onPress={() => setEditando(true)}>
                <Ionicons name="add-outline" size={26} color={theme.primary} />
              </TouchableOpacity>
            )}
            {editando && <View style={{ width: 26 }} />}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />

          ) : editando ? (
            <View>
              <Text style={[styles.subtitle, { color: theme.textoSecundario }]}>
                Define el límite mensual por categoría de gasto.
              </Text>

              {/* Categorías ya añadidas */}
              {categorias.map(c => {
                const { icon, color } = getIcono(c.nombre);
                return (
                  <View key={c.nombre} style={[styles.catEditRow, { backgroundColor: theme.fondoCard }]}>
                    <View style={[styles.catEditIcono, { backgroundColor: color + '20' }]}>
                      <Ionicons name={icon} size={18} color={color} />
                    </View>
                    <Text style={[styles.catEditNombre, { color: theme.texto }]}>{c.nombre}</Text>
                    <TextInput
                      style={[styles.catEditInput, { borderBottomColor: theme.primary, color: theme.texto }]}
                      value={c.limite}
                      onChangeText={v => actualizarLimite(c.nombre, v)}
                      keyboardType="decimal-pad"
                    />
                    <Text style={[styles.catEditEuro, { color: theme.textoSecundario }]}>€</Text>
                    <TouchableOpacity onPress={() => eliminarCategoria(c.nombre)}>
                      <Ionicons name="trash-outline" size={20} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                );
              })}

              {/* Añadir nueva categoría */}
              <View style={[styles.nuevaCatCard, { backgroundColor: theme.fondoCard, borderColor: theme.borde }]}>
                <Text style={[styles.nuevaCatTitle, { color: theme.texto }]}>Añadir categoría</Text>

                {/* Selector con chips + texto libre */}
                <SelectorCategoria
                  grupoId={grupo._id}
                  value={nuevaCat}
                  onChange={setNuevaCat}
                />

                {/* Campo límite + botón añadir */}
                <View style={styles.nuevaCatRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.limiteLabel, { color: theme.textoSecundario }]}>Límite mensual</Text>
                    <TextInput
                      placeholder="0.00 €"
                      placeholderTextColor={theme.textoTerciario}
                      style={[styles.limiteInput, { borderBottomColor: theme.primary, color: theme.texto }]}
                      value={nuevoLimite}
                      onChangeText={setNuevoLimite}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.btnAñadir,
                      { backgroundColor: nuevaCat && nuevoLimite ? theme.primary : theme.primaryBorder }
                    ]}
                    onPress={agregarCategoria}
                    disabled={!nuevaCat || !nuevoLimite}
                  >
                    <Ionicons name="add" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.btnGuardar, { backgroundColor: theme.primary }, guardando && { opacity: 0.7 }]}
                onPress={guardar} disabled={guardando}
              >
                {guardando
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.btnGuardarText}>Guardar presupuesto</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnCancelar, { borderColor: theme.borde }]}
                onPress={() => { setEditando(false); fetchEstado(); }}
              >
                <Text style={[styles.btnCancelarText, { color: theme.textoSecundario }]}>Cancelar</Text>
              </TouchableOpacity>

              {estado && (
                <TouchableOpacity style={styles.btnEliminar} onPress={eliminarPresupuesto}>
                  <Text style={[styles.btnEliminarText, { color: theme.danger }]}>Eliminar presupuesto</Text>
                </TouchableOpacity>
              )}
            </View>

          ) : estado ? (
            <View>
              <View style={[
                styles.resumenCard, { backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder },
                estado.total_pct >= 100 && { backgroundColor: theme.modo === 'oscuro' ? '#1a0a0a' : '#fff1f0', borderColor: '#fca5a5' },
                estado.total_pct >= 80 && estado.total_pct < 100 && { backgroundColor: theme.modo === 'oscuro' ? '#1a1200' : '#fffbeb', borderColor: '#fde68a' },
              ]}>
                <Text style={[styles.resumenMes, { color: theme.textoSecundario }]}>
                  {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </Text>
                <Text style={[styles.resumenGastado, { color: theme.primaryDark }]}>{estado.total_gastado.toFixed(2)} €</Text>
                <Text style={[styles.resumenDe, { color: theme.textoSecundario }]}>de {estado.total_limite.toFixed(2)} € presupuestados</Text>
                <View style={[styles.barraFondo, { backgroundColor: theme.borde }]}>
                  <View style={[
                    styles.barraRelleno, { backgroundColor: theme.primary },
                    { width: `${Math.min(estado.total_pct, 100)}%` },
                    estado.total_pct >= 100 && { backgroundColor: theme.danger },
                    estado.total_pct >= 80 && estado.total_pct < 100 && { backgroundColor: theme.warning },
                  ]} />
                </View>
                <Text style={[styles.resumenRestante, { color: theme.textoSecundario }]}>
                  {estado.total_pct >= 100
                    ? `⚠️ Excedido en ${Math.abs(estado.total_restante).toFixed(2)} €`
                    : `Quedan ${estado.total_restante.toFixed(2)} €`}
                </Text>
              </View>

              <Text style={[styles.seccionTitle, { color: theme.texto }]}>Por categoría</Text>
              {estado.categorias.map(cat => {
                const { icon, color } = getIcono(cat.nombre);
                return (
                  <View key={cat.nombre} style={[styles.catCard, { backgroundColor: theme.fondoCard }]}>
                    <View style={styles.catHeader}>
                      <View style={[styles.catIcono, { backgroundColor: color + '20' }]}>
                        <Ionicons name={icon} size={18} color={color} />
                      </View>
                      <Text style={[styles.catNombre, { color: theme.texto }]}>{cat.nombre}</Text>
                      <Text style={[styles.catImporte, { color: cat.excedido ? theme.danger : theme.primaryDark }]}>
                        {cat.gastado.toFixed(2)} / {cat.limite.toFixed(2)} €
                      </Text>
                    </View>
                    <View style={[styles.barraFondo, { backgroundColor: theme.borde }]}>
                      <View style={[styles.barraRelleno, { width: `${Math.min(cat.pct, 100)}%`, backgroundColor: cat.excedido ? theme.danger : color }]} />
                    </View>
                    <Text style={[styles.catRestante, { color: cat.excedido ? theme.danger : theme.textoTerciario }]}>
                      {cat.excedido
                        ? `⚠️ Excedido en ${Math.abs(cat.restante).toFixed(2)} €`
                        : `${cat.pct.toFixed(0)}% usado · quedan ${cat.restante.toFixed(2)} €`}
                    </Text>
                  </View>
                );
              })}
            </View>

          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={64} color={theme.textoTerciario} />
              <Text style={[styles.emptyText, { color: theme.textoTerciario }]}>Sin presupuesto configurado</Text>
              <Text style={[styles.emptySub, { color: theme.textoTerciario }]}>
                Define límites mensuales por categoría para controlar los gastos del grupo.
              </Text>
              <TouchableOpacity style={[styles.btnCrear, { backgroundColor: theme.primary }]} onPress={() => setEditando(true)}>
                <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.btnCrearText}>Crear presupuesto</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </AppBackground>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1 },
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title:     { fontSize: 18, fontWeight: '700' },
  subtitle:  { fontSize: 13, marginBottom: 16 },

  resumenCard:     { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 20, borderWidth: 1 },
  resumenMes:      { fontSize: 13, textTransform: 'capitalize' },
  resumenGastado:  { fontSize: 36, fontWeight: 'bold', marginVertical: 4 },
  resumenDe:       { fontSize: 13, marginBottom: 10 },
  resumenRestante: { fontSize: 13, marginTop: 8 },

  barraFondo:  { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden' },
  barraRelleno:{ height: 8, borderRadius: 4 },

  seccionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },

  catCard:    { borderRadius: 12, padding: 14, marginBottom: 10 },
  catHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  catIcono:   { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  catNombre:  { flex: 1, fontSize: 14, fontWeight: '600' },
  catImporte: { fontSize: 13, fontWeight: '700' },
  catRestante:{ fontSize: 11, marginTop: 6 },

  catEditRow:   { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 10, marginBottom: 8, gap: 8 },
  catEditIcono: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  catEditNombre:{ flex: 1, fontSize: 14, fontWeight: '500' },
  catEditInput: { width: 70, borderBottomWidth: 2, textAlign: 'right', fontSize: 15 },
  catEditEuro:  { fontSize: 14 },

  nuevaCatCard:  { borderRadius: 12, padding: 14, marginTop: 8, marginBottom: 16, borderWidth: 1 },
  nuevaCatTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  nuevaCatRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 8 },
  limiteLabel:   { fontSize: 12, marginBottom: 4 },
  limiteInput:   { borderBottomWidth: 2, paddingVertical: 6, fontSize: 15 },

  btnAñadir: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },

  btnGuardar:     { borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  btnGuardarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnCancelar:    { borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, marginBottom: 10 },
  btnCancelarText:{ fontSize: 15 },
  btnEliminar:    { padding: 14, alignItems: 'center' },
  btnEliminarText:{ fontSize: 14 },

  emptyContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyText:      { fontSize: 16, fontWeight: '600', marginTop: 16 },
  emptySub:       { fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  btnCrear:       { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginTop: 24 },
  btnCrearText:   { color: '#fff', fontWeight: '700', fontSize: 15 },
});