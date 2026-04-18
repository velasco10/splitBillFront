import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { API_URL } from '../config';
import { useAuth } from '../utils/authContext';
import AppBackground from '../components/AppBackground';

const CATEGORIA_ICONOS = {
  alquiler:     { icon: 'home-outline',           color: '#42a5f5' },
  luz:          { icon: 'flash-outline',           color: '#ffa726' },
  agua:         { icon: 'water-outline',           color: '#29b6f6' },
  internet:     { icon: 'wifi-outline',            color: '#66bb6a' },
  alimentacion: { icon: 'cart-outline',            color: '#ef5350' },
  limpieza:     { icon: 'sparkles-outline',        color: '#ab47bc' },
  otros:        { icon: 'receipt-outline',         color: '#888'    },
};

function getIcono(cat = '') {
  return CATEGORIA_ICONOS[cat.toLowerCase()] || CATEGORIA_ICONOS.otros;
}

export default function PresupuestoScreen({ route, navigation }) {
  const { grupo } = route.params;
  const { token } = useAuth();
  const isFocused = useIsFocused();

  const [estado, setEstado]       = useState(null);
  const [editando, setEditando]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estado edición
  const [categorias, setCategorias] = useState([]);
  const [nuevaCat, setNuevaCat]     = useState('');
  const [nuevoLimite, setNuevoLimite] = useState('');

  useEffect(() => {
    if (isFocused) fetchEstado();
  }, [isFocused]);

  const fetchEstado = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/presupuestos/grupo/${grupo._id}/estado`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEstado(data);
        if (data?.categorias) {
          setCategorias(data.categorias.map(c => ({
            nombre: c.nombre,
            limite: c.limite.toString()
          })));
        }
      } else {
        setEstado(null);
      }
    } catch (e) {
      console.error('Error cargando presupuesto:', e);
    } finally {
      setLoading(false);
    }
  };

  const agregarCategoria = () => {
    const nombre = nuevaCat.trim().toLowerCase();
    if (!nombre) return;
    if (!nuevoLimite || parseFloat(nuevoLimite) <= 0) {
      Alert.alert('Error', 'Introduce un límite válido');
      return;
    }
    if (categorias.find(c => c.nombre === nombre)) {
      Alert.alert('Repetida', 'Ya existe esa categoría');
      return;
    }
    setCategorias([...categorias, { nombre, limite: nuevoLimite }]);
    setNuevaCat('');
    setNuevoLimite('');
  };

  const eliminarCategoria = (nombre) => {
    setCategorias(categorias.filter(c => c.nombre !== nombre));
  };

  const actualizarLimite = (nombre, valor) => {
    setCategorias(categorias.map(c =>
      c.nombre === nombre ? { ...c, limite: valor } : c
    ));
  };

  const guardar = async () => {
    if (categorias.length === 0) {
      Alert.alert('Error', 'Añade al menos una categoría');
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/presupuestos/grupo/${grupo._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          categorias: categorias.map(c => ({
            nombre: c.nombre,
            limite: parseFloat(c.limite)
          }))
        })
      });
      if (!res.ok) throw new Error('Error al guardar');
      setEditando(false);
      fetchEstado();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarPresupuesto = () => {
    Alert.alert(
      'Eliminar presupuesto',
      '¿Seguro que quieres eliminar el presupuesto de este grupo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_URL}/presupuestos/grupo/${grupo._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              setEstado(null);
              setCategorias([]);
            } catch (e) {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <AppBackground>

          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={26} color="#42a5f5" />
            </TouchableOpacity>
            <Text style={styles.title}>Presupuesto mensual</Text>
            {estado && !editando && (
              <TouchableOpacity onPress={() => setEditando(true)}>
                <Ionicons name="pencil-outline" size={22} color="#42a5f5" />
              </TouchableOpacity>
            )}
            {!estado && !editando && (
              <TouchableOpacity onPress={() => setEditando(true)}>
                <Ionicons name="add-outline" size={26} color="#42a5f5" />
              </TouchableOpacity>
            )}
            {editando && <View style={{ width: 26 }} />}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#42a5f5" style={{ marginTop: 40 }} />
          ) : editando ? (

            /* ── MODO EDICIÓN ── */
            <View>
              <Text style={styles.subtitle}>
                Define el límite mensual por categoría de gasto.
              </Text>

              {/* Lista categorías editables */}
              {categorias.map(c => (
                <View key={c.nombre} style={styles.catEditRow}>
                  <View style={styles.catEditIcono}>
                    <Ionicons name={getIcono(c.nombre).icon} size={18} color={getIcono(c.nombre).color} />
                  </View>
                  <Text style={styles.catEditNombre}>{c.nombre}</Text>
                  <TextInput
                    style={styles.catEditInput}
                    value={c.limite}
                    onChangeText={v => actualizarLimite(c.nombre, v)}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.catEditEuro}>€</Text>
                  <TouchableOpacity onPress={() => eliminarCategoria(c.nombre)}>
                    <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Añadir nueva categoría */}
              <View style={styles.nuevaCatCard}>
                <Text style={styles.nuevaCatTitle}>Añadir categoría</Text>
                <TextInput
                  placeholder="Nombre (ej: alquiler, luz...)"
                  placeholderTextColor="#6B7280"
                  style={styles.input}
                  value={nuevaCat}
                  onChangeText={setNuevaCat}
                  autoCapitalize="none"
                />
                <View style={styles.nuevaCatRow}>
                  <TextInput
                    placeholder="Límite €"
                    placeholderTextColor="#6B7280"
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    value={nuevoLimite}
                    onChangeText={setNuevoLimite}
                    keyboardType="decimal-pad"
                  />
                  <TouchableOpacity style={styles.btnAñadir} onPress={agregarCategoria}>
                    <Ionicons name="add" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Botones guardar / cancelar */}
              <TouchableOpacity
                style={[styles.btnGuardar, guardando && { opacity: 0.7 }]}
                onPress={guardar}
                disabled={guardando}
              >
                {guardando
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.btnGuardarText}>Guardar presupuesto</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={() => { setEditando(false); fetchEstado(); }}
              >
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>

              {estado && (
                <TouchableOpacity style={styles.btnEliminar} onPress={eliminarPresupuesto}>
                  <Text style={styles.btnEliminarText}>Eliminar presupuesto</Text>
                </TouchableOpacity>
              )}
            </View>

          ) : estado ? (

            /* ── MODO VISTA ── */
            <View>
              {/* Resumen total */}
              <View style={[
                styles.resumenCard,
                estado.total_pct >= 100 && styles.resumenCardExcedido,
                estado.total_pct >= 80 && estado.total_pct < 100 && styles.resumenCardAviso,
              ]}>
                <Text style={styles.resumenMes}>
                  {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </Text>
                <Text style={styles.resumenGastado}>{estado.total_gastado.toFixed(2)} €</Text>
                <Text style={styles.resumenDe}>de {estado.total_limite.toFixed(2)} € presupuestados</Text>
                <View style={styles.barraFondo}>
                  <View style={[
                    styles.barraRelleno,
                    { width: `${Math.min(estado.total_pct, 100)}%` },
                    estado.total_pct >= 100 && { backgroundColor: '#e74c3c' },
                    estado.total_pct >= 80 && estado.total_pct < 100 && { backgroundColor: '#f59e0b' },
                  ]} />
                </View>
                <Text style={styles.resumenRestante}>
                  {estado.total_pct >= 100
                    ? `⚠️ Excedido en ${Math.abs(estado.total_restante).toFixed(2)} €`
                    : `Quedan ${estado.total_restante.toFixed(2)} €`}
                </Text>
              </View>

              {/* Por categoría */}
              <Text style={styles.seccionTitle}>Por categoría</Text>
              {estado.categorias.map(cat => {
                const { icon, color } = getIcono(cat.nombre);
                return (
                  <View key={cat.nombre} style={styles.catCard}>
                    <View style={styles.catHeader}>
                      <View style={[styles.catIcono, { backgroundColor: color + '20' }]}>
                        <Ionicons name={icon} size={18} color={color} />
                      </View>
                      <Text style={styles.catNombre}>{cat.nombre}</Text>
                      <Text style={[styles.catImporte, cat.excedido && { color: '#e74c3c' }]}>
                        {cat.gastado.toFixed(2)} / {cat.limite.toFixed(2)} €
                      </Text>
                    </View>
                    <View style={styles.barraFondo}>
                      <View style={[
                        styles.barraRelleno,
                        { width: `${Math.min(cat.pct, 100)}%`, backgroundColor: color },
                        cat.excedido && { backgroundColor: '#e74c3c' },
                      ]} />
                    </View>
                    <Text style={[styles.catRestante, cat.excedido && { color: '#e74c3c' }]}>
                      {cat.excedido
                        ? `⚠️ Excedido en ${Math.abs(cat.restante).toFixed(2)} €`
                        : `${cat.pct.toFixed(0)}% usado · quedan ${cat.restante.toFixed(2)} €`}
                    </Text>
                  </View>
                );
              })}
            </View>

          ) : (

            /* ── SIN PRESUPUESTO ── */
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Sin presupuesto configurado</Text>
              <Text style={styles.emptySub}>
                Define límites mensuales por categoría para controlar los gastos del grupo.
              </Text>
              <TouchableOpacity
                style={styles.btnCrear}
                onPress={() => setEditando(true)}
              >
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
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  title:    { fontSize: 18, fontWeight: '700', color: '#111' },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 16 },

  resumenCard: {
    backgroundColor: '#eff6ff', borderRadius: 14,
    padding: 16, alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  resumenCardAviso:   { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  resumenCardExcedido:{ backgroundColor: '#fff1f0', borderColor: '#fca5a5' },
  resumenMes:      { fontSize: 13, color: '#666', textTransform: 'capitalize' },
  resumenGastado:  { fontSize: 36, fontWeight: 'bold', color: '#2563eb', marginVertical: 4 },
  resumenDe:       { fontSize: 13, color: '#888', marginBottom: 10 },
  resumenRestante: { fontSize: 13, color: '#555', marginTop: 8 },

  barraFondo:  { width: '100%', height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  barraRelleno:{ height: 8, backgroundColor: '#42a5f5', borderRadius: 4 },

  seccionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },

  catCard: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14, marginBottom: 10 },
  catHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  catIcono:  { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  catNombre: { flex: 1, fontSize: 14, fontWeight: '600', color: '#333' },
  catImporte:{ fontSize: 13, fontWeight: '700', color: '#2563eb' },
  catRestante:{ fontSize: 11, color: '#888', marginTop: 6 },

  catEditRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8f9fa', borderRadius: 10,
    padding: 10, marginBottom: 8, gap: 8,
  },
  catEditIcono:  { width: 32, height: 32, borderRadius: 16, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  catEditNombre: { flex: 1, fontSize: 14, fontWeight: '500', color: '#333' },
  catEditInput:  { width: 70, borderBottomWidth: 2, borderBottomColor: '#42a5f5', textAlign: 'right', fontSize: 15, color: '#111' },
  catEditEuro:   { fontSize: 14, color: '#666' },

  nuevaCatCard:  { backgroundColor: '#f0f7ff', borderRadius: 12, padding: 14, marginTop: 8, marginBottom: 16 },
  nuevaCatTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  nuevaCatRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },

  input: {
    borderBottomWidth: 2, borderBottomColor: '#42a5f5',
    marginBottom: 10, paddingVertical: 6,
    fontSize: 15, color: '#111',
  },

  btnAñadir: {
    backgroundColor: '#42a5f5', width: 40, height: 40,
    borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },

  btnGuardar: {
    backgroundColor: '#42a5f5', borderRadius: 12,
    padding: 14, alignItems: 'center', marginBottom: 10,
  },
  btnGuardarText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  btnCancelar: {
    borderRadius: 12, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 10,
  },
  btnCancelarText: { color: '#555', fontSize: 15 },

  btnEliminar:     { padding: 14, alignItems: 'center' },
  btnEliminarText: { color: '#e74c3c', fontSize: 14 },

  emptyContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyText:      { fontSize: 16, fontWeight: '600', color: '#aaa', marginTop: 16 },
  emptySub:       { fontSize: 13, color: '#ccc', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  btnCrear: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#42a5f5', borderRadius: 12,
    padding: 14, marginTop: 24,
  },
  btnCrearText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});