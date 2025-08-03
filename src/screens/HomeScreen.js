// src/screens/HomeScreen.js
import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { obtenerGruposUnidos } from '../utils/localGroups';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../config';
import { salirDeGrupo } from '../utils/localGroups';

export default function HomeScreen({ navigation }) {
    const [grupos, setGrupos] = useState([]);
    const [opcionesVisibles, setOpcionesVisibles] = useState(false);

    const fetchGrupos = async () => {
        const ids = await obtenerGruposUnidos();
        const grupos = await Promise.all(ids.map(async (id) => {
            const res = await fetch(`${API_URL}/grupos/${id}`);
            return await res.json();
        }));
        setGrupos(grupos);
    };

    useFocusEffect(
        useCallback(() => {
            fetchGrupos();
        }, [])
    );

    useEffect(() => {
        fetchGrupos();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mis Grupos</Text>
            <FlatList
                data={grupos}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.grupoItem}
                        onPress={() => navigation.navigate('DetalleGrupo', { grupo: item })}
                        onLongPress={() => {
                            Alert.alert(
                                'Salir del grupo',
                                `¿Seguro que quieres salir de "${item.nombre}"?`,
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Salir',
                                        style: 'destructive',
                                        onPress: async () => {
                                            try {
                                                await salirDeGrupo(item._id);
                                                Alert.alert("Saliste del grupo");
                                                fetchGrupos();
                                            } catch (err) {
                                                console.error("Error al salir del grupo:", err);
                                                Alert.alert("Error", "No se pudo salir del grupo.");
                                            }
                                        },
                                    },
                                ]
                            );
                        }}
                    >
                        <Text>{item.nombre}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text>No tienes grupos aún.</Text>}
            />
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setOpcionesVisibles(!opcionesVisibles)}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
            {opcionesVisibles && (
                <View style={styles.fabOptions}>
                    <TouchableOpacity style={styles.fabOption} onPress={() => {
                        setOpcionesVisibles(false);
                        navigation.navigate('CrearGrupo');
                    }}>
                        <Text>Crear grupo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fabOption} onPress={() => {
                        setOpcionesVisibles(false);
                        navigation.navigate('UnirseGrupo');
                    }}>
                        <Text>Unirse a grupo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.fabOption}
                        onPress={() => {
                            setOpcionesVisibles(false);
                            navigation.navigate('CamaraScreen');
                        }}>
                        <Text>Dividir cuenta</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    grupoItem: { padding: 16, backgroundColor: '#eee', borderRadius: 8, marginBottom: 10 },
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
        zIndex: 20
    },
    fabOptions: {
        position: 'absolute',
        right: 30,
        bottom: 100,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        elevation: 6
    },
    fabOption: {
        padding: 10,
        alignItems: 'center'
    }
});
