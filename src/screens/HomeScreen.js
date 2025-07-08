// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { obtenerGrupos } from '../api/grupos';



export default function HomeScreen({ navigation }) {
    const [grupos, setGrupos] = useState([]);
    const [opcionesVisibles, setOpcionesVisibles] = useState(false);

    useEffect(() => {
        async function fetchGrupos() {
            try {
                const data = await obtenerGrupos();
                setGrupos(data);
            } catch (e) {
                setGrupos([]);
            }
        }
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
