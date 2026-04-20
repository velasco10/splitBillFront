import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { API_URL } from '../config';
import { salirDeGrupo } from '../utils/localGroups';
import AppBackground from '../components/AppBackground';
import { useAuth } from '../utils/authContext';
import { useTheme } from '../utils/themeContext';

function calcularSaldos(miembros = [], gastos = []) {
  const saldos = {};
  miembros.forEach(m => saldos[m] = 0);
  gastos.forEach(g => {
    const division = g.division || [];
    if (division.length === 0) return;
    division.forEach(d => {
      if (d.nombre !== g.emisor) {
        saldos[d.nombre] = (saldos[d.nombre] || 0) - d.importe;
        saldos[g.emisor] = (saldos[g.emisor] || 0) + d.importe;
      }
    });
  });
  for (const nombre in saldos) {
    const redondeado = Math.round((saldos[nombre] + Number.EPSILON) * 100) / 100;
    saldos[nombre] = redondeado === -0 ? 0 : redondeado;
  }
  return saldos;
}

const TIPO_LABEL = {
  love: '👫 Pareja', work: '💼 Trabajo', party: '🍺 Fiesta',
  friends: '👥 Amigos', travel: '✈️ Viaje', default: '🏠 Grupo',
};

const OPCIONES = [
  { key: 'persona',     icon: 'person-add-outline',      label: 'Añadir persona',    premium: false },
  { key: 'invitar',     icon: 'share-outline',           label: 'Invitar al grupo',  premium: false },
  { key: 'gasto',       icon: 'cash-outline',            label: 'Nuevo gasto',       premium: false },
  { key: 'desglose',    icon: 'list-outline',            label: 'Desglose de gastos',premium: false },
  { key: 'stats',       icon: 'bar-chart-outline',       label: 'Estadísticas',      premium: true  },
  { key: 'presupuesto', icon: 'wallet-outline',          label: 'Presupuesto',       premium: true  },
  { key: 'programado',  icon: 'calendar-outline',        label: 'Pagos programados', premium: true  },
  { key: 'ajustar',     icon: 'swap-horizontal-outline', label: 'Ajustar cuentas',   premium: false },
  { key: 'salir',       icon: 'exit-outline',            label: 'Salir del grupo',   premium: false, danger: true },
];

export default function DetalleGrupoScreen({ route, navigation }) {
  const { grupoId } = route.params;
  const { usuario, token } = useAuth();
  const { theme } = useTheme();
  const esPremium = usuario?.plan === 'premium';

  const [grupo, setGrupo]                       = useState(null);
  const [gastos, setGastos]                     = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [opcionesVisibles, setOpcionesVisibles] = useState(false);
  const [presupuesto, setPresupuesto]           = useState(null);
  const isFocused = useIsFocused();

  const volverAlHome = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  const fetchDatos = async () => {
    setLoading(true);
    try {
      const requests = [
        fetch(`${API_URL}/grupos/${grupoId}`),
        fetch(`${API_URL}/gastos/grupo/${grupoId}`)
      ];
      if (esPremium && token) {
        requests.push(fetch(`${API_URL}/presupuestos/grupo/${grupoId}/estado`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }));
      }
      const results    = await Promise.all(requests);
      const dataGrupo  = await results[0].json();
      const dataGastos = await results[1].json();
      setGrupo(dataGrupo);
      setGastos(dataGastos);
      if (esPremium && results[2]?.ok) {
        setPresupuesto(await results[2].json());
      }
    } catch (error) {
      console.error('Error cargando detalle:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isFocused) fetchDatos(); }, [isFocused]);

  if (loading || !grupo) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const miembros    = grupo.miembros || [];
  const saldos      = calcularSaldos(miembros, gastos);
  const tablaDatos  = miembros.map(nombre => ({ nombre, importe: (saldos[nombre] || 0).toFixed(2) }));
  const totalGastos = gastos.reduce((acc, g) => acc + g.importe, 0).toFixed(2);

  const handleOpcion = async (key) => {
    setOpcionesVisibles(false);
    switch (key) {
      case 'persona':     navigation.navigate('AgregarPersona', { grupo }); break;
      case 'invitar':     navigation.navigate('Invitar', { grupo }); break;
      case 'gasto':       navigation.navigate('NuevoGasto', { grupo }); break;
      case 'desglose':    navigation.navigate('DesgloseGastos', { grupo }); break;
      case 'stats':       navigation.navigate('Estadisticas', { grupoId: grupo._id }); break;
      case 'presupuesto': navigation.navigate('Presupuesto', { grupo }); break;
      case 'programado':  navigation.navigate('PagosProgramados', { grupo }); break;
      case 'ajustar':     navigation.navigate('AjustarCuentas', { grupo, saldos }); break;
      case 'salir':       await salirDeGrupo(grupo._id); volverAlHome(); break;
    }
  };

  const handleOpcionConBloqueo = (opcion) => {
    if (opcion.premium && !esPremium) {
      Alert.alert('🔒 Función Premium', `"${opcion.label}" está disponible en el plan Premium.`,
        [{ text: 'Ahora no', style: 'cancel' },
         { text: 'Ver planes', onPress: () => navigation.navigate(usuario ? 'Perfil' : 'Login') }]);
      return;
    }
    handleOpcion(opcion.key);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <View style={[styles.container, { backgroundColor: theme.fondo }]}>
        <AppBackground>

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={volverAlHome}>
              <Ionicons name="home-outline" size={28} color={theme.primary} />
            </TouchableOpacity>
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text style={[styles.title, { color: theme.texto }]}>{grupo.nombre}</Text>
              <Text style={[styles.subtitle, { color: theme.textoSecundario }]}>
                {TIPO_LABEL[grupo.tipo] || TIPO_LABEL.default} · {miembros.length} miembros
              </Text>
            </View>
          </View>

          <View style={[styles.resumenCard, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.resumenLabel, { color: theme.textoSecundario }]}>Total gastado</Text>
            <Text style={[styles.resumenImporte, { color: theme.primaryDark }]}>{totalGastos} €</Text>
            <Text style={[styles.resumenSub, { color: theme.textoTerciario }]}>{gastos.length} gastos registrados</Text>
          </View>

          {esPremium && presupuesto && (
            <TouchableOpacity
              style={[
                styles.presupuestoCard, { backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder },
                presupuesto.total_pct >= 100 && { backgroundColor: theme.modo === 'oscuro' ? '#1a0a0a' : '#fff1f0', borderColor: '#fca5a5' },
                presupuesto.total_pct >= 80 && presupuesto.total_pct < 100 && { backgroundColor: theme.modo === 'oscuro' ? '#1a1200' : '#fffbeb', borderColor: '#fde68a' },
              ]}
              onPress={() => navigation.navigate('Presupuesto', { grupo })}
            >
              <View style={styles.presupuestoHeader}>
                <Ionicons name="wallet-outline" size={16} color={presupuesto.total_pct >= 100 ? theme.danger : presupuesto.total_pct >= 80 ? theme.warning : theme.primary} />
                <Text style={[styles.presupuestoTitle, { color: theme.texto }]}>Presupuesto del mes</Text>
                <Ionicons name="chevron-forward-outline" size={14} color={theme.textoTerciario} style={{ marginLeft: 'auto' }} />
              </View>
              <View style={[styles.barraFondo, { backgroundColor: theme.borde }]}>
                <View style={[
                  styles.barraRelleno, { backgroundColor: theme.primary },
                  { width: `${Math.min(presupuesto.total_pct, 100)}%` },
                  presupuesto.total_pct >= 100 && { backgroundColor: theme.danger },
                  presupuesto.total_pct >= 80 && presupuesto.total_pct < 100 && { backgroundColor: theme.warning },
                ]} />
              </View>
              <Text style={[styles.presupuestoSub, { color: theme.textoSecundario }]}>
                {presupuesto.total_pct >= 100
                  ? `⚠️ Presupuesto excedido`
                  : `${presupuesto.total_gastado.toFixed(2)} € de ${presupuesto.total_limite.toFixed(2)} € · ${presupuesto.total_pct.toFixed(0)}%`}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.seccionTitle, { color: theme.texto }]}>Saldos</Text>
          <View style={[styles.tablaHeader, { borderBottomColor: theme.borde }]}>
            <Text style={[styles.tablaColNombre, { color: theme.textoSecundario }]}>Miembro</Text>
            <Text style={[{ flex: 1, textAlign: 'right', color: theme.textoSecundario }]}>Saldo (€)</Text>
          </View>

          <FlatList
            data={tablaDatos}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              const importe = parseFloat(item.importe);
              return (
                <View style={[styles.tablaRow, { borderBottomColor: theme.borde }]}>
                  <View style={styles.tablaColNombre}>
                    <Text style={[styles.nombreText, { color: theme.texto }]}>{item.nombre}</Text>
                    <Text style={[styles.saldoLabel, { color: theme.textoTerciario }]}>
                      {importe > 0 ? 'le deben' : importe < 0 ? 'debe' : 'en paz'}
                    </Text>
                  </View>
                  <Text style={[styles.tablaColImporte, { color: importe < 0 ? theme.danger : importe > 0 ? theme.success : theme.textoTerciario }]}>
                    {importe > 0 ? '+' : ''}{item.importe} €
                  </Text>
                </View>
              );
            }}
            ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textoTerciario }]}>Añade miembros para ver los saldos</Text>}
          />

          <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => setOpcionesVisibles(!opcionesVisibles)}>
            <Ionicons name={opcionesVisibles ? 'close' : 'add'} size={32} color="white" />
          </TouchableOpacity>

          {opcionesVisibles && (
            <View style={[styles.fabOptions, { backgroundColor: theme.fondoCard }]}>
              {OPCIONES.map(opcion => {
                const bloqueado = opcion.premium && !esPremium;
                return (
                  <TouchableOpacity key={opcion.key} style={styles.fabOption} onPress={() => handleOpcionConBloqueo(opcion)}>
                    <Ionicons name={opcion.icon} size={20} color={opcion.danger ? theme.danger : bloqueado ? theme.textoTerciario : theme.primary} />
                    <Text style={[styles.fabOptionText, { color: theme.texto }, opcion.danger && { color: theme.danger }, bloqueado && { color: theme.textoTerciario }]}>
                      {opcion.label}
                    </Text>
                    {bloqueado && <Ionicons name="lock-closed" size={12} color={theme.textoTerciario} style={{ marginLeft: 'auto' }} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:        { flex: 1 },
  container:       { flex: 1, padding: 20 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title:           { fontSize: 22, fontWeight: 'bold' },
  subtitle:        { fontSize: 13, marginTop: 2 },
  resumenCard:     { borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center' },
  resumenLabel:    { fontSize: 13 },
  resumenImporte:  { fontSize: 32, fontWeight: 'bold', marginVertical: 4 },
  resumenSub:      { fontSize: 12 },
  presupuestoCard:    { borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1 },
  presupuestoHeader:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  presupuestoTitle:   { fontSize: 13, fontWeight: '600' },
  presupuestoSub:     { fontSize: 11, marginTop: 6 },
  barraFondo:         { height: 6, borderRadius: 3, overflow: 'hidden' },
  barraRelleno:       { height: 6, borderRadius: 3 },
  seccionTitle:       { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  tablaHeader:        { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 8, marginBottom: 4 },
  tablaRow:           { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, alignItems: 'center' },
  tablaColNombre:     { flex: 2 },
  nombreText:         { fontSize: 15, fontWeight: '500' },
  saldoLabel:         { fontSize: 11, marginTop: 2 },
  tablaColImporte:    { flex: 1, textAlign: 'right', fontSize: 16, fontWeight: 'bold' },
  emptyText:          { textAlign: 'center', marginTop: 20 },
  fab:         { position: 'absolute', right: 30, bottom: 50, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, zIndex: 20 },
  fabOptions:  { position: 'absolute', right: 30, bottom: 120, borderRadius: 12, padding: 8, elevation: 6, zIndex: 30, minWidth: 220 },
  fabOption:     { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  fabOptionText: { fontSize: 15, flex: 1 },
});