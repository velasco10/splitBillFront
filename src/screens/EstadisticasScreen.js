import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ActivityIndicator, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';

const CATEGORIA_ICONOS = {
  alquiler:     { icon: 'home-outline',            color: '#42a5f5' },
  luz:          { icon: 'flash-outline',            color: '#ffa726' },
  agua:         { icon: 'water-outline',            color: '#29b6f6' },
  internet:     { icon: 'wifi-outline',             color: '#66bb6a' },
  alimentacion: { icon: 'cart-outline',             color: '#ef5350' },
  limpieza:     { icon: 'sparkles-outline',         color: '#ab47bc' },
  ajuste:       { icon: 'swap-horizontal-outline',  color: '#26a69a' },
  otros:        { icon: 'receipt-outline',          color: '#888'    },
};

function getIcono(categoria = '') {
  return CATEGORIA_ICONOS[categoria.toLowerCase()] || CATEGORIA_ICONOS.otros;
}

function BarraProgreso({ porcentaje, color }) {
  return (
    <View style={styles.barraFondo}>
      <View style={[styles.barraRelleno, { width: `${Math.min(porcentaje, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function EstadisticasScreen({ route }) {
  const { grupoId } = route.params;
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/estadisticas/grupo/${grupoId}`);
      const data = await res.json();
      setDatos(data);
    } catch (e) {
      console.error('Error cargando estadísticas:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#42a5f5" />
        </View>
      </SafeAreaView>
    );
  }

  if (!datos || datos.total === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <AppBackground>
            <Text style={styles.title}>Estadísticas</Text>
            <View style={styles.emptyContainer}>
              <Ionicons name="bar-chart-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Sin datos todavía</Text>
              <Text style={styles.emptySub}>Añade gastos para ver las estadísticas del grupo</Text>
            </View>
          </AppBackground>
        </View>
      </SafeAreaView>
    );
  }

  const categorias = Object.entries(datos.por_categoria).sort((a, b) => b[1] - a[1]);
  const personas   = Object.entries(datos.por_persona).sort((a, b) => b[1] - a[1]);
  const maxCategoria = categorias[0]?.[1] || 1;
  const maxPersona   = personas[0]?.[1] || 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <AppBackground>
          <Text style={styles.title}>Estadísticas</Text>

          {/* Total general */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total gastado</Text>
            <Text style={styles.totalValor}>{datos.total.toFixed(2)} €</Text>
          </View>

          {/* Por categoría */}
          <Text style={styles.seccionTitle}>Por categoría</Text>
          {categorias.map(([cat, importe]) => {
            const { icon, color } = getIcono(cat);
            const pct = (importe / datos.total) * 100;
            return (
              <View key={cat} style={styles.fila}>
                <View style={[styles.filaIcono, { backgroundColor: color + '20' }]}>
                  <Ionicons name={icon} size={18} color={color} />
                </View>
                <View style={styles.filaInfo}>
                  <View style={styles.filaHeaderRow}>
                    <Text style={styles.filaNombre}>{cat}</Text>
                    <Text style={styles.filaImporte}>{importe.toFixed(2)} €</Text>
                  </View>
                  <BarraProgreso porcentaje={(importe / maxCategoria) * 100} color={color} />
                  <Text style={styles.filaPct}>{pct.toFixed(1)}% del total</Text>
                </View>
              </View>
            );
          })}

          {/* Por persona */}
          <Text style={styles.seccionTitle}>Por persona</Text>
          {personas.map(([nombre, importe]) => {
            const pct = (importe / datos.total) * 100;
            return (
              <View key={nombre} style={styles.fila}>
                <View style={[styles.filaIcono, { backgroundColor: '#42a5f520' }]}>
                  <Ionicons name="person-outline" size={18} color="#42a5f5" />
                </View>
                <View style={styles.filaInfo}>
                  <View style={styles.filaHeaderRow}>
                    <Text style={styles.filaNombre}>{nombre}</Text>
                    <Text style={styles.filaImporte}>{importe.toFixed(2)} €</Text>
                  </View>
                  <BarraProgreso porcentaje={(importe / maxPersona) * 100} color="#42a5f5" />
                  <Text style={styles.filaPct}>{pct.toFixed(1)}% del total</Text>
                </View>
              </View>
            );
          })}

        </AppBackground>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:        { flex: 1, backgroundColor: '#fff' },
  container:       { flex: 1, padding: 20, backgroundColor: '#fff' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },

  totalCard: {
    backgroundColor: '#eff6ff', borderRadius: 14,
    padding: 20, alignItems: 'center', marginBottom: 24,
  },
  totalLabel: { fontSize: 13, color: '#666' },
  totalValor: { fontSize: 36, fontWeight: 'bold', color: '#2563eb', marginTop: 4 },

  seccionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12, marginTop: 8 },

  fila: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: 16, gap: 12,
  },
  filaIcono: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 2,
  },
  filaInfo:      { flex: 1 },
  filaHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  filaNombre:    { fontSize: 14, fontWeight: '600', color: '#333' },
  filaImporte:   { fontSize: 14, fontWeight: '700', color: '#2563eb' },
  filaPct:       { fontSize: 11, color: '#aaa', marginTop: 4 },

  barraFondo:   { height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, overflow: 'hidden' },
  barraRelleno: { height: 6, borderRadius: 3 },

  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 60 },
  emptyText:      { fontSize: 18, fontWeight: '600', color: '#aaa', marginTop: 16 },
  emptySub:       { fontSize: 13, color: '#ccc', marginTop: 8, textAlign: 'center' },
});