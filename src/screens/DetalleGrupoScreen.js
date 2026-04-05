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
    love: '👫 Pareja',
    work: '💼 Trabajo',
    party: '🍺 Fiesta',
    friends: '👥 Amigos',
    travel: '✈️ Viaje',
    default: '🏠 Grupo',
};

// Opciones del FAB con su config
const OPCIONES = [
    { key: 'persona', icon: 'person-add-outline', label: 'Añadir persona', premium: false },
    { key: 'invitar', icon: 'share-outline', label: 'Invitar al grupo', premium: false },
    { key: 'gasto', icon: 'cash-outline', label: 'Nuevo gasto', premium: false },
    { key: 'desglose', icon: 'list-outline', label: 'Desglose de gastos', premium: false },
    { key: 'stats', icon: 'bar-chart-outline', label: 'Estadísticas', premium: true },
    { key: 'programado', icon: 'calendar-outline', label: 'Pagos programados', premium: true },
    { key: 'ajustar', icon: 'swap-horizontal-outline', label: 'Ajustar cuentas', premium: false },
    { key: 'salir', icon: 'exit-outline', label: 'Salir del grupo', premium: false, danger: true },
];

export default function DetalleGrupoScreen({ route, navigation }) {
    const { grupoId } = route.params;
    const { usuario } = useAuth();
    const esPremium = usuario?.plan === 'premium';

    const [grupo, setGrupo] = useState(null);
    const [gastos, setGastos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [opcionesVisibles, setOpcionesVisibles] = useState(false);
    const isFocused = useIsFocused();

    const volverAlHome = () => navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
    });

    const fetchDatos = async () => {
        setLoading(true);
        try {
            const [resGrupo, resGastos] = await Promise.all([
                fetch(`${API_URL}/grupos/${grupoId}`),
                fetch(`${API_URL}/gastos/grupo/${grupoId}`)
            ]);
            const dataGrupo = await resGrupo.json();
            const dataGastos = await resGastos.json();
            setGrupo(dataGrupo);
            setGastos(dataGastos);
        } catch (error) {
            console.error('Error cargando detalle:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) fetchDatos();
    }, [isFocused]);

    if (loading || !grupo) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#42a5f5" />
                </View>
            </SafeAreaView>
        );
    }

    const miembros = grupo.miembros || [];
    const saldos = calcularSaldos(miembros, gastos);
    const tablaDatos = miembros.map(nombre => ({
        nombre,
        importe: (saldos[nombre] || 0).toFixed(2),
    }));
    const totalGastos = gastos.reduce((acc, g) => acc + g.importe, 0).toFixed(2);

    const handleOpcion = async (key) => {
        setOpcionesVisibles(false);
        switch (key) {
            case 'persona':
                navigation.navigate('AgregarPersona', { grupo });
                break;
            case 'invitar':
                navigation.navigate('Invitar', { grupo });
                break;
            case 'gasto':
                navigation.navigate('NuevoGasto', { grupo });
                break;
            case 'desglose':
                navigation.navigate('DesgloseGastos', { grupo });
                break;
            case 'stats':
                navigation.navigate('Estadisticas', { grupoId: grupo._id });
                break;
            case 'programado':
                navigation.navigate('PagosProgramados', { grupo });
                break;
            case 'ajustar':
                navigation.navigate('AjustarCuentas', { grupo, saldos });
                break;
            case 'salir':
                await salirDeGrupo(grupo._id);
                volverAlHome();
                break;
        }
    };

    const handleOpcionConBloqueo = (opcion) => {
        if (opcion.premium && !esPremium) {
            Alert.alert(
                '🔒 Función Premium',
                `"${opcion.label}" está disponible en el plan Premium.`,
                [
                    { text: 'Ahora no', style: 'cancel' },
                    { text: 'Ver planes', onPress: () => navigation.navigate(usuario ? 'Perfil' : 'Login') }
                ]
            );
            return;
        }
        handleOpcion(opcion.key);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <AppBackground>

                    {/* Header */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={volverAlHome}>
                            <Ionicons name="home-outline" size={28} color="#42a5f5" />
                        </TouchableOpacity>
                        <View style={{ marginLeft: 15, flex: 1 }}>
                            <Text style={styles.title}>{grupo.nombre}</Text>
                            <Text style={styles.subtitle}>
                                {TIPO_LABEL[grupo.tipo] || TIPO_LABEL.default} · {miembros.length} miembros
                            </Text>
                        </View>
                    </View>

                    {/* Resumen total */}
                    <View style={styles.resumenCard}>
                        <Text style={styles.resumenLabel}>Total gastado</Text>
                        <Text style={styles.resumenImporte}>{totalGastos} €</Text>
                        <Text style={styles.resumenSub}>{gastos.length} gastos registrados</Text>
                    </View>

                    {/* Tabla saldos */}
                    <Text style={styles.seccionTitle}>Saldos</Text>
                    <View style={styles.tablaHeader}>
                        <Text style={styles.tablaColNombre}>Miembro</Text>
                        <Text style={styles.tablaColImporte}>Saldo (€)</Text>
                    </View>

                    <FlatList
                        data={tablaDatos}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => {
                            const importe = parseFloat(item.importe);
                            return (
                                <View style={styles.tablaRow}>
                                    <View style={styles.tablaColNombre}>
                                        <Text style={styles.nombreText}>{item.nombre}</Text>
                                        <Text style={styles.saldoLabel}>
                                            {importe > 0 ? 'le deben' : importe < 0 ? 'debe' : 'en paz'}
                                        </Text>
                                    </View>
                                    <Text style={[
                                        styles.tablaColImporte,
                                        { color: importe < 0 ? '#e74c3c' : importe > 0 ? '#2ecc71' : '#888' }
                                    ]}>
                                        {importe > 0 ? '+' : ''}{item.importe} €
                                    </Text>
                                </View>
                            );
                        }}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>Añade miembros para ver los saldos</Text>
                        }
                    />

                    {/* FAB */}
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => setOpcionesVisibles(!opcionesVisibles)}
                    >
                        <Ionicons name={opcionesVisibles ? 'close' : 'add'} size={32} color="white" />
                    </TouchableOpacity>

                    {opcionesVisibles && (
                        <View style={styles.fabOptions}>
                            {OPCIONES.map(opcion => {
                                const bloqueado = opcion.premium && !esPremium;
                                return (
                                    <TouchableOpacity
                                        key={opcion.key}
                                        style={styles.fabOption}
                                        onPress={() => handleOpcionConBloqueo(opcion)}
                                    >
                                        <Ionicons
                                            name={opcion.icon}
                                            size={20}
                                            color={opcion.danger ? '#e74c3c' : bloqueado ? '#bbb' : '#42a5f5'}
                                        />
                                        <Text style={[
                                            styles.fabOptionText,
                                            opcion.danger && { color: '#e74c3c' },
                                            bloqueado && { color: '#bbb' },
                                        ]}>
                                            {opcion.label}
                                        </Text>
                                        {bloqueado && (
                                            <Ionicons name="lock-closed" size={12} color="#bbb" style={{ marginLeft: 'auto' }} />
                                        )}
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
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 22, fontWeight: 'bold' },
    subtitle: { fontSize: 13, color: '#666', marginTop: 2 },

    resumenCard: {
        backgroundColor: '#eff6ff', borderRadius: 12,
        padding: 16, marginBottom: 20, alignItems: 'center',
    },
    resumenLabel: { fontSize: 13, color: '#666' },
    resumenImporte: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', marginVertical: 4 },
    resumenSub: { fontSize: 12, color: '#888' },

    seccionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },

    tablaHeader: {
        flexDirection: 'row', borderBottomWidth: 1,
        borderBottomColor: '#ddd', paddingBottom: 8, marginBottom: 4,
    },
    tablaRow: {
        flexDirection: 'row', paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center',
    },
    tablaColNombre: { flex: 2 },
    nombreText: { fontSize: 15, fontWeight: '500' },
    saldoLabel: { fontSize: 11, color: '#aaa', marginTop: 2 },
    tablaColImporte: { flex: 1, textAlign: 'right', fontSize: 16, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },

    fab: {
        position: 'absolute', right: 30, bottom: 50,
        backgroundColor: '#42a5f5', width: 60, height: 60,
        borderRadius: 30, justifyContent: 'center', alignItems: 'center',
        elevation: 5, zIndex: 20,
    },
    fabOptions: {
        position: 'absolute', right: 30, bottom: 120,
        backgroundColor: '#fff', borderRadius: 12,
        padding: 8, elevation: 6, zIndex: 30, minWidth: 220,
    },
    fabOption: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
    fabOptionText: { fontSize: 15, color: '#333', flex: 1 },
});