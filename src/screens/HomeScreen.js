import React, { useCallback, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    Alert, SafeAreaView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { salirDeGrupo, limpiarGruposInvalidos } from '../utils/localGroups';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';
import { useAuth } from '../utils/authContext';

const ICONOS_GRUPO = {
    work: { name: 'briefcase-outline', color: '#42a5f5' },
    party: { name: 'beer-outline', color: '#ab47bc' },
    love: { name: 'heart-outline', color: '#ef5350' },
    friends: { name: 'people-outline', color: '#26a69a' },
    home: { name: 'home-outline', color: '#66bb6a' },
    travel: { name: 'airplane-outline', color: '#ff7043' },
    default: { name: 'apps-outline', color: '#888' },
};

export default function HomeScreen({ navigation }) {
    const { usuario } = useAuth();
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [opcionesVisibles, setOpcionesVisibles] = useState(false);

    const cargarGrupos = async () => {
        setLoading(true);
        try {
            const ids = await limpiarGruposInvalidos();
            if (ids.length === 0) {
                setGrupos([]);
                return;
            }
            const response = await fetch(`${API_URL}/grupos/varios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
            });
            if (response.ok) {
                const data = await response.json();
                setGrupos(data);
            }
        } catch (error) {
            console.error('Error cargando grupos:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { cargarGrupos(); }, []));

    const confirmarSalir = (item) => {
        Alert.alert(
            'Salir del grupo',
            `¿Seguro que quieres salir de "${item.nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Salir',
                    style: 'destructive',
                    onPress: async () => {
                        await salirDeGrupo(item._id);
                        cargarGrupos();
                    },
                },
            ]
        );
    };

    const renderGrupo = ({ item }) => {
        const icono = ICONOS_GRUPO[item.tipo] || ICONOS_GRUPO.default;
        return (
            <View style={styles.grupoItem}>
                <TouchableOpacity
                    style={styles.grupoTouch}
                    onPress={() => navigation.navigate('DetalleGrupo', { grupoId: item._id })}
                >
                    <Ionicons name={icono.name} size={22} color={icono.color} style={{ marginRight: 10 }} />
                    <View>
                        <Text style={styles.nombreGrupo}>{item.nombre}</Text>
                        <Text style={styles.subGrupo}>
                            {item.tipo === 'love' ? '👫 Pareja'
                                : item.tipo === 'work' ? '💼 Trabajo'
                                    : item.tipo === 'party' ? '🍺 Fiesta'
                                        : item.tipo === 'friends' ? '👥 Amigos'
                                            : item.tipo === 'travel' ? '✈️ Viaje'
                                                : '🏠 Grupo'} · {item.miembros?.length || 0} miembros
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.salirBtn} onPress={() => confirmarSalir(item)}>
                    <Ionicons name="exit-outline" size={20} color="#e74c3c" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <AppBackground>

                    {/* Header */}
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Mis Grupos</Text>
                        <TouchableOpacity
                            style={styles.perfilBtn}
                            onPress={() => navigation.navigate(usuario ? 'Perfil' : 'Login')}
                        >
                            <Ionicons
                                name={usuario ? 'person-circle-outline' : 'log-in-outline'}
                                size={28}
                                color="#42a5f5"
                            />
                            {!usuario && <Text style={styles.loginText}>Entrar</Text>}
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#42a5f5" />
                            <Text style={styles.loaderText}>Cargando tus grupos...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={grupos}
                            keyExtractor={(item) => item._id.toString()}
                            renderItem={renderGrupo}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="people-outline" size={48} color="#ccc" />
                                    <Text style={styles.emptyText}>No tienes grupos aún</Text>
                                    <Text style={styles.emptySubText}>Crea uno o únete a uno existente</Text>
                                </View>
                            }
                        />
                    )}

                    {/* FAB */}
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => setOpcionesVisibles(!opcionesVisibles)}
                    >
                        <Ionicons name={opcionesVisibles ? 'close' : 'add'} size={32} color="white" />
                    </TouchableOpacity>

                    {opcionesVisibles && (
                        <View style={styles.fabOptions}>
                            <TouchableOpacity
                                style={styles.fabOption}
                                onPress={() => { setOpcionesVisibles(false); navigation.navigate('CrearGrupo'); }}
                            >
                                <Ionicons name="add-circle-outline" size={20} color="#42a5f5" />
                                <Text style={styles.fabOptionText}>Crear grupo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.fabOption}
                                onPress={() => { setOpcionesVisibles(false); navigation.navigate('UnirseGrupo'); }}
                            >
                                <Ionicons name="enter-outline" size={20} color="#42a5f5" />
                                <Text style={styles.fabOptionText}>Unirse a grupo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.fabOption}
                                onPress={() => { setOpcionesVisibles(false); navigation.navigate('CamaraScreen'); }}
                            >
                                <Ionicons name="camera-outline" size={20} color="#42a5f5" />
                                <Text style={styles.fabOptionText}>Dividir cuenta</Text>
                            </TouchableOpacity>
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

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold' },
    perfilBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    loginText: { fontSize: 13, color: '#42a5f5', fontWeight: '600' },

    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 10, color: '#42a5f5' },

    emptyContainer: { flex: 1, alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 16, color: '#888', marginTop: 12, fontWeight: '500' },
    emptySubText: { fontSize: 13, color: '#bbb', marginTop: 4 },

    grupoItem: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', padding: 16,
        backgroundColor: '#f8f9fa', borderRadius: 12,
        marginBottom: 10, elevation: 2,
    },
    grupoTouch: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    nombreGrupo: { fontSize: 16, fontWeight: '600' },
    subGrupo: { fontSize: 12, color: '#888', marginTop: 2 },
    salirBtn: { paddingHorizontal: 10 },

    fab: {
        position: 'absolute', right: 30, bottom: 50,
        backgroundColor: '#42a5f5', width: 60, height: 60,
        borderRadius: 30, justifyContent: 'center', alignItems: 'center',
        elevation: 5, zIndex: 20,
    },
    fabOptions: {
        position: 'absolute', right: 30, bottom: 120,
        backgroundColor: '#fff', borderRadius: 12,
        padding: 8, elevation: 6, zIndex: 30, minWidth: 200,
    },
    fabOption: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
    fabOptionText: { fontSize: 15, color: '#333' },
});