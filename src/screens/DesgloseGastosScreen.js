import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, SafeAreaView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';

const CATEGORIA_ICONOS = {
  alquiler:     { icon: 'home-outline',       color: '#42a5f5' },
  luz:          { icon: 'flash-outline',       color: '#ffa726' },
  agua:         { icon: 'water-outline',       color: '#29b6f6' },
  internet:     { icon: 'wifi-outline',        color: '#66bb6a' },
  alimentacion: { icon: 'cart-outline',        color: '#ef5350' },
  limpieza:     { icon: 'sparkles-outline',    color: '#ab47bc' },
  otros:        { icon: 'receipt-outline',     color: '#888'    },
};

function getIconoCategoria(categoria = '') {
  return CATEGORIA_ICONOS[categoria.toLowerCase()] || CATEGORIA_ICONOS.otros;
}

export default function DesgloseGastosScreen({ route, navigation }) {
  const { grupo } = route.params;
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // 'todos' | nombre de miembro

  useEffect(() => {
    fetchGastos();
  }, []);

  const fetchGastos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/gastos/grupo/${grupo._id}`);
      const data = await res.json();
      setGastos(data);
    } catch (e) {
      console.error('Error cargando gastos:', e);
    } finally {
      setLoading(false);
    }
  };

  const gastosFiltrados = filtro === 'todos'
    ? gastos
    : gastos.filter(g => g.emisor === filtro || g.division?.some(d => d.nombre === filtro));

  const totalFiltrado = gastosFiltrados.reduce((acc, g) => acc + g.importe, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppBackground>
          <Text style={styles.title}>Desglose de gastos</Text>

          {/* Filtro por miembro */}
          <View style={styles.filtroScroll}>
            {['todos', ...(grupo.miembros || [])].map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.filtroBtn, filtro === m && styles.filtroBtnActivo]}
                onPress={() => setFiltro(m)}
              >
                <Text style={[styles.filtroBtnText, filtro === m && styles.filtroBtnTextActivo]}>
                  {m === 'todos' ? 'Todos' : m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Resumen */}
          <View style={styles.resumen}>
            <Text style={styles.resumenLabel}>
              {gastosFiltrados.length} gastos · Total:
            </Text>
            <Text style={styles.resumenTotal}>{totalFiltrado.toFixed(2)} €</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#42a5f5" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={gastosFiltrados}
              keyExtractor={item => item._id}
              renderItem={({ item }) => {
                const { icon, color } = getIconoCategoria(item.categoria);
                return (
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => navigation.navigate('DetalleGasto', { gasto: item, grupo })}
                  >
                    <View style={[styles.iconoCategoria, { backgroundColor: color + '20' }]}>
                      <Ionicons name={icon} size={20} color={color} />
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.concepto}>{item.concepto}</Text>
                      <Text style={styles.meta}>
                        {item.fecha} · Pagó {item.emisor}
                      </Text>
                      {item.categoria && item.categoria !== 'otros' && (
                        <Text style={styles.categoriaTag}>{item.categoria}</Text>
                      )}
                    </View>
                    <View style={styles.rowDerecha}>
                      <Text style={styles.importe}>{item.importe.toFixed(2)} €</Text>
                      <Text style={styles.modoBadge}>{item.modo_division}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="receipt-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>Sin gastos registrados</Text>
                </View>
              }
            />
          )}
        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:   { flex: 1, backgroundColor: '#fff' },
  container:  { flex: 1, padding: 20, backgroundColor: '#fff' },
  title:      { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },

  filtroScroll: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filtroBtn:         { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f0f0f0' },
  filtroBtnActivo:   { backgroundColor: '#42a5f5' },
  filtroBtnText:     { fontSize: 13, color: '#555' },
  filtroBtnTextActivo: { color: '#fff', fontWeight: '600' },

  resumen:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resumenLabel: { fontSize: 13, color: '#888' },
  resumenTotal: { fontSize: 16, fontWeight: '700', color: '#2563eb' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  iconoCategoria: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  rowInfo:        { flex: 1 },
  concepto:       { fontSize: 15, fontWeight: '600', color: '#111' },
  meta:           { fontSize: 12, color: '#888', marginTop: 2 },
  categoriaTag:   { fontSize: 11, color: '#42a5f5', marginTop: 2 },
  rowDerecha:     { alignItems: 'flex-end' },
  importe:        { fontSize: 15, fontWeight: '700', color: '#2563eb' },
  modoBadge:      { fontSize: 10, color: '#aaa', marginTop: 2 },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText:      { color: '#aaa', marginTop: 12, fontSize: 15 },
});