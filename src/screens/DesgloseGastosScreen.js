import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';
import { useTheme } from '../utils/themeContext';

const CATEGORIA_ICONOS = {
  alquiler:     { icon: 'home-outline',    color: '#42a5f5' },
  luz:          { icon: 'flash-outline',   color: '#ffa726' },
  agua:         { icon: 'water-outline',   color: '#29b6f6' },
  internet:     { icon: 'wifi-outline',    color: '#66bb6a' },
  alimentacion: { icon: 'cart-outline',    color: '#ef5350' },
  limpieza:     { icon: 'sparkles-outline',color: '#ab47bc' },
  otros:        { icon: 'receipt-outline', color: '#888'    },
};

function getIconoCategoria(categoria = '') {
  return CATEGORIA_ICONOS[categoria.toLowerCase()] || CATEGORIA_ICONOS.otros;
}

export default function DesgloseGastosScreen({ route, navigation }) {
  const { grupo }    = route.params;
  const { theme }    = useTheme();
  const [gastos, setGastos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro]   = useState('todos');

  useEffect(() => { fetchGastos(); }, []);

  const fetchGastos = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/gastos/grupo/${grupo._id}`);
      setGastos(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const gastosFiltrados = filtro === 'todos' ? gastos : gastos.filter(g => g.emisor === filtro || g.division?.some(d => d.nombre === filtro));
  const totalFiltrado   = gastosFiltrados.reduce((acc, g) => acc + g.importe, 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <View style={[styles.container, { backgroundColor: theme.fondo }]}>
        <AppBackground>
          <Text style={[styles.title, { color: theme.texto }]}>Desglose de gastos</Text>

          <View style={styles.filtroScroll}>
            {['todos', ...(grupo.miembros || [])].map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.filtroBtn, { backgroundColor: theme.fondoCard }, filtro === m && { backgroundColor: theme.primary }]}
                onPress={() => setFiltro(m)}
              >
                <Text style={[styles.filtroBtnText, { color: theme.textoSecundario }, filtro === m && { color: '#fff', fontWeight: '600' }]}>
                  {m === 'todos' ? 'Todos' : m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.resumen}>
            <Text style={[styles.resumenLabel, { color: theme.textoSecundario }]}>{gastosFiltrados.length} gastos · Total:</Text>
            <Text style={[styles.resumenTotal, { color: theme.primaryDark }]}>{totalFiltrado.toFixed(2)} €</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={gastosFiltrados}
              keyExtractor={item => item._id}
              renderItem={({ item }) => {
                const { icon, color } = getIconoCategoria(item.categoria);
                return (
                  <TouchableOpacity
                    style={[styles.row, { borderBottomColor: theme.borde }]}
                    onPress={() => navigation.navigate('DetalleGasto', { gasto: item, grupo })}
                  >
                    <View style={[styles.iconoCategoria, { backgroundColor: color + '20' }]}>
                      <Ionicons name={icon} size={20} color={color} />
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={[styles.concepto, { color: theme.texto }]}>{item.concepto}</Text>
                      <Text style={[styles.meta, { color: theme.textoSecundario }]}>{item.fecha} · Pagó {item.emisor}</Text>
                      {item.categoria && item.categoria !== 'otros' && (
                        <Text style={[styles.categoriaTag, { color: theme.primary }]}>{item.categoria}</Text>
                      )}
                    </View>
                    <View style={styles.rowDerecha}>
                      <Text style={[styles.importe, { color: theme.primaryDark }]}>{item.importe.toFixed(2)} €</Text>
                      <Text style={[styles.modoBadge, { color: theme.textoTerciario }]}>{item.modo_division}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="receipt-outline" size={48} color={theme.textoTerciario} />
                  <Text style={[styles.emptyText, { color: theme.textoTerciario }]}>Sin gastos registrados</Text>
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
  safeArea:  { flex: 1 },
  container: { flex: 1, padding: 20 },
  title:     { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  filtroScroll:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filtroBtn:           { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  filtroBtnText:       { fontSize: 13 },
  resumen:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resumenLabel: { fontSize: 13 },
  resumenTotal: { fontSize: 16, fontWeight: '700' },
  row:            { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  iconoCategoria: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  rowInfo:        { flex: 1 },
  concepto:       { fontSize: 15, fontWeight: '600' },
  meta:           { fontSize: 12, marginTop: 2 },
  categoriaTag:   { fontSize: 11, marginTop: 2 },
  rowDerecha:     { alignItems: 'flex-end' },
  importe:        { fontSize: 15, fontWeight: '700' },
  modoBadge:      { fontSize: 10, marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText:      { marginTop: 12, fontSize: 15 },
});