import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { API_URL } from '../config';
import { useLayoutEffect } from 'react';

function calcularSaldos(miembros, gastos) {
    const saldos = {};
    miembros.forEach(m => saldos[m] = 0);

    gastos.forEach(g => {
        const parte = g.importe / g.beneficiarios.length;
        g.beneficiarios.forEach(b => {
            if (b !== g.emisor) {
                saldos[b] -= parte;
                saldos[g.emisor] += parte;
            }
        });
    });

    // ✅ Arregla decimales, evita -0.00
    for (const nombre in saldos) {
        const redondeado = Math.round((saldos[nombre] + Number.EPSILON) * 100) / 100;
        saldos[nombre] = redondeado === -0 ? 0 : redondeado;
    }

    return saldos;
}


export default function DetalleGrupoScreen({ route, navigation }) {
    const { grupo } = route.params;
    const [gastos, setGastos] = useState([]);
    const [grupoActual, setGrupoActual] = useState(grupo); // Estado para grupo actualizado
    const [opcionesVisibles, setOpcionesVisibles] = useState(false);
    const isFocused = useIsFocused();

    // Refresca el grupo y los gastos cuando la pantalla esté enfocada
    useEffect(() => {
        async function fetchGrupoYGastos() {
            // 1. Refresca grupo
            const resGrupo = await fetch(`${API_URL}/grupos/${grupo._id}`);
            const dataGrupo = await resGrupo.json();
            setGrupoActual(dataGrupo);

            // 2. Refresca gastos
            const resGastos = await fetch(`${API_URL}/gastos/grupo/${grupo._id}`);
            const dataGastos = await resGastos.json();
            setGastos(dataGastos);
        }

        fetchGrupoYGastos();
    }, [isFocused, grupo._id]);
    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => navigation.navigate('Home')}
                    style={{ paddingLeft: 16 }}
                >
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);
    const saldos = calcularSaldos(grupoActual.miembros, gastos);

    // Prepara los datos para la tabla
    const tablaDatos = grupoActual.miembros.map(nombre => ({
        nombre,
        importe: (saldos[nombre] || 0).toFixed(2),
    }));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{grupoActual.nombre}</Text>
            <Text style={styles.subtitle}>{grupoActual.descripcion}</Text>

            <View style={styles.tablaHeader}>
                <Text style={styles.tablaColNombre}>Nombre</Text>
                <Text style={styles.tablaColImporte}>Saldo (€)</Text>
            </View>
            <FlatList
                data={tablaDatos}
                keyExtractor={item => item.nombre}
                renderItem={({ item }) => (
                    <View style={styles.tablaRow}>
                        <Text style={styles.tablaColNombre}>{item.nombre}</Text>
                        <Text style={[
                            styles.tablaColImporte,
                            { color: parseFloat(item.importe) < 0 ? 'red' : '#42a5f5' }
                        ]}>{item.importe}</Text>
                    </View>
                )}
            />

            {/* Botón flotante */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setOpcionesVisibles(!opcionesVisibles)}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
            {opcionesVisibles && (
                <View style={styles.fabOptions}>
                    <TouchableOpacity
                        style={styles.fabOption}
                        onPress={() => {
                            setOpcionesVisibles(false);
                            navigation.navigate('AgregarPersona', { grupo: grupoActual });
                        }}>
                        <Text>Añadir persona</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.fabOption}
                        onPress={() => {
                            setOpcionesVisibles(false);
                            navigation.navigate('NuevoGasto', { grupo: grupoActual });
                        }}>
                        <Text>Nuevo gasto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.fabOption}
                        onPress={() => {
                            setOpcionesVisibles(false);
                            navigation.navigate('DesgloseGastos', { grupo: grupoActual });
                        }}>
                        <Text>Desglose de gastos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.fabOption}
                        onPress={() => {
                            setOpcionesVisibles(false);
                            navigation.navigate('Invitar', { grupo: grupoActual });
                        }}>
                        <Text>Invitar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.fabOption}
                        onPress={() => {
                            setOpcionesVisibles(false);
                            navigation.navigate('AjustarCuentas', {
                                grupo: grupoActual,
                                saldos,
                            });
                        }}
                    >
                        <Text>Ajustar cuentas</Text>
                    </TouchableOpacity>

                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
    tablaHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd', marginBottom: 8 },
    tablaRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    tablaColNombre: { flex: 2, fontWeight: '500', fontSize: 16 },
    tablaColImporte: { flex: 1, textAlign: 'right', fontSize: 16 },
    fab: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        backgroundColor: '#42a5f5',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 20,
    },
    fabOptions: {
        position: 'absolute',
        right: 30,
        bottom: 100,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        elevation: 6,
        zIndex: 21,
    },
    fabOption: {
        padding: 10,
        alignItems: 'center',
    },
});
