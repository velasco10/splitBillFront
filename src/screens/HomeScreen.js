import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { obtenerGruposUnidos, salirDeGrupo, limpiarGruposInvalidos } from '../utils/localGroups';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';

export default function HomeScreen({ navigation }) {
    const iconosGrupo = {
        work: { name: 'briefcase-outline', color: '#42a5f5' },
        party: { name: 'beer-outline', color: '#ab47bc' },
        love: { name: 'heart-outline', color: '#ef5350' },
        friends: { name: 'people-outline', color: '#26a69a' },
        default: { name: 'apps-outline', color: '#888' }
    };
    const [grupos, setGrupos] = useState([]);
    const [opcionesVisibles, setOpcionesVisibles] = useState(false);

    const fetchGrupos = async () => {
        const ids = await obtenerGruposUnidos();
        const grupos = await Promise.all(ids.map(async (id) => {
            const res = await fetch(`${API_URL}/grupos/${id}`);
            if (!res.ok) return null;
            const g = await res.json();
            return g?.nombre ? g : null;
        }));
        setGrupos(grupos.filter(Boolean));
    };

    useFocusEffect(
        useCallback(() => {
            const cargar = async () => {
                const ids = await limpiarGruposInvalidos();
                const grupos = [];
                for (const id of ids) {
                    try {
                        const r = await fetch(`${API_URL}/grupos/${id}`);
                        if (!r.ok) continue;
                        const g = await r.json();
                        grupos.push(g);
                    } catch { }
                }
                setGrupos(grupos);
            };
            cargar();
        }, [])
    );

    useEffect(() => {
        fetchGrupos();
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <AppBackground>
                    <Text style={styles.title}>Mis Grupos</Text>
                    <FlatList
                        data={grupos}
                        keyExtractor={(item, index) => item?._id?.toString() || index.toString()}
                        renderItem={({ item }) => {
  const icono = iconosGrupo[item.icono] || iconosGrupo.default;

  return (
    <View style={styles.grupoItem}>
      <TouchableOpacity
        style={styles.grupoTouch}
        onPress={() => navigation.navigate('DetalleGrupo', { grupo: item })}
      >
        <Ionicons name={icono.name} size={20} color={icono.color} style={{ marginRight: 10 }} />
        <Text style={styles.nombreGrupo}>{item.nombre}</Text>

        <View style={styles.infoDerecha}>
          <Ionicons name="people-outline" size={18} color="#42a5f5" style={{ marginLeft: 12, marginRight: 4 }} />
          <Text style={{ color: '#42a5f5' }}>{item.miembros?.length || 0}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.salirBtn}
        onPress={() =>
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
                    Alert.alert("Error", "No se pudo salir del grupo.");
                  }
                },
              },
            ]
          )
        }
      >
        <Ionicons name="exit-outline" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );
}}


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

                </AppBackground>
            </View >
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    grupoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#eee',
        borderRadius: 8,
        marginBottom: 10,
    },

    grupoTouch: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1, // ocupa todo excepto el botón de salir
},

nombreGrupo: {
  fontSize: 16,
  fontWeight: '500',
},

infoDerecha: {
  flexDirection: 'row',
  alignItems: 'center',
  marginLeft: 'auto',
},


    salirBtn: {
        paddingHorizontal: 6,
    },

    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, padding: 20, paddingBottom: 40, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    fab: {
        position: 'absolute',
        right: 30,
        bottom: 50, // ⬅️ más alto que antes (30), para no chocar con la barra
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
        bottom: 120, // se desplaza también
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
