import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';
import { useTheme } from '../utils/themeContext';

const CATEGORIA_ICONOS = {
  alquiler:     { icon: 'home-outline',           color: '#42a5f5' },
  luz:          { icon: 'flash-outline',           color: '#ffa726' },
  agua:         { icon: 'water-outline',           color: '#29b6f6' },
  internet:     { icon: 'wifi-outline',            color: '#66bb6a' },
  alimentacion: { icon: 'cart-outline',            color: '#ef5350' },
  limpieza:     { icon: 'sparkles-outline',        color: '#ab47bc' },
  ajuste:       { icon: 'swap-horizontal-outline', color: '#26a69a' },
  otros:        { icon: 'receipt-outline',         color: '#888'    },
};

function getIcono(categoria = '') {
  return CATEGORIA_ICONOS[categoria.toLowerCase()] || CATEGORIA_ICONOS.otros;
}

function BarraProgreso({ porcentaje, color, theme }) {
  return (
    <View style={[styles.barraFondo, { backgroundColor: theme.borde }]}>
      <View style={[styles.barraRelleno, { width: `${Math.min(porcentaje, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function EstadisticasScreen({ route }) {
  const { grupoId } = route.params;
  const { theme }   = useTheme();
  const [datos, setDatos]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEstadisticas(); }, []);

  const fetchEstadisticas = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/estadisticas/grupo/${grupoId}`);
      setDatos(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
        <View style={styles.loaderContainer}><ActivityIndicator size="large" color={theme.primary} /></View>
      </SafeAreaView>
    );
  }

  if (!datos || datos.total === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
        <View style={[styles.container, { backgroundColor: theme.fondo }]}>
          <AppBackground>
            <Text style={[styles.title, { color: theme.texto }]}>Estadísticas</Text>
            <View style={styles.emptyContainer}>
              <Ionicons name="bar-chart-outline" size={64} color={theme.textoTerciario} />
              <Text style={[styles.emptyText, { color: theme.textoTerciario }]}>Sin datos todavía</Text>
              <Text style={[styles.emptySub, { color: theme.textoTerciario }]}>Añade gastos para ver las estadísticas del grupo</Text>
            </View>
          </AppBackground>
        </View>
      </SafeAreaView>
    );
  }

  const categorias   = Object.entries(datos.por_categoria).sort((a, b) => b[1] - a[1]);
  const personas     = Object.entries(datos.por_persona).sort((a, b) => b[1] - a[1]);
  const maxCategoria = categorias[0]?.[1] || 1;
  const maxPersona   = personas[0]?.[1] || 1;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <ScrollView style={[styles.container, { backgroundColor: theme.fondo }]}>
        <AppBackground>
          <Text style={[styles.title, { color: theme.texto }]}>Estadísticas</Text>

          <View style={[styles.totalCard, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.totalLabel, { color: theme.textoSecundario }]}>Total gastado</Text>
            <Text style={[styles.totalValor, { color: theme.primaryDark }]}>{datos.total.toFixed(2)} €</Text>
          </View>

          <Text style={[styles.seccionTitle, { color: theme.texto }]}>Por categoría</Text>
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
                    <Text style={[styles.filaNombre, { color: theme.texto }]}>{cat}</Text>
                    <Text style={[styles.filaImporte, { color: theme.primaryDark }]}>{importe.toFixed(2)} €</Text>
                  </View>
                  <BarraProgreso porcentaje={(importe / maxCategoria) * 100} color={color} theme={theme} />
                  <Text style={[styles.filaPct, { color: theme.textoTerciario }]}>{pct.toFixed(1)}% del total</Text>
                </View>
              </View>
            );
          })}

          <Text style={[styles.seccionTitle, { color: theme.texto }]}>Por persona</Text>
          {personas.map(([nombre, importe]) => {
            const pct = (importe / datos.total) * 100;
            return (
              <View key={nombre} style={styles.fila}>
                <View style={[styles.filaIcono, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="person-outline" size={18} color={theme.primary} />
                </View>
                <View style={styles.filaInfo}>
                  <View style={styles.filaHeaderRow}>
                    <Text style={[styles.filaNombre, { color: theme.texto }]}>{nombre}</Text>
                    <Text style={[styles.filaImporte, { color: theme.primaryDark }]}>{importe.toFixed(2)} €</Text>
                  </View>
                  <BarraProgreso porcentaje={(importe / maxPersona) * 100} color={theme.primary} theme={theme} />
                  <Text style={[styles.filaPct, { color: theme.textoTerciario }]}>{pct.toFixed(1)}% del total</Text>
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
  safeArea:        { flex: 1 },
  container:       { flex: 1, padding: 20 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title:           { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  totalCard:       { borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 24 },
  totalLabel:      { fontSize: 13 },
  totalValor:      { fontSize: 36, fontWeight: 'bold', marginTop: 4 },
  seccionTitle:    { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  fila:            { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  filaIcono:       { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  filaInfo:        { flex: 1 },
  filaHeaderRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  filaNombre:      { fontSize: 14, fontWeight: '600' },
  filaImporte:     { fontSize: 14, fontWeight: '700' },
  filaPct:         { fontSize: 11, marginTop: 4 },
  barraFondo:      { height: 6, borderRadius: 3, overflow: 'hidden' },
  barraRelleno:    { height: 6, borderRadius: 3 },
  emptyContainer:  { flex: 1, alignItems: 'center', marginTop: 60 },
  emptyText:       { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySub:        { fontSize: 13, marginTop: 8, textAlign: 'center' },
});