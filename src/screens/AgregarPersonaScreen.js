import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert } from 'react-native';
import { API_URL } from '@env';

export default function AgregarPersonaScreen({ route, navigation }) {
    const { grupo } = route.params;
    const [nombre, setNombre] = useState('');
    const [entrarEnGastos, setEntrarEnGastos] = useState(false);

    const agregarPersona = async () => {
        try {
            // 1. Actualiza miembros en la colección grupo
            await fetch(`${API_URL}/grupos/${grupo._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    miembros: [...grupo.miembros, nombre]
                }),
            });
            // 2. Si entra en los gastos, actualiza todos los gastos de este grupo añadiendo como beneficiario
            if (entrarEnGastos) {
                await fetch(`${API_URL}/gastos/grupo/${grupo._id}/agregar_beneficiario`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ beneficiario: nombre })
                });
            }
            Alert.alert('¡Listo!', 'Persona añadida correctamente');
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', 'No se pudo añadir la persona');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Añadir persona</Text>
            <TextInput
                placeholder="Nombre del nuevo miembro"
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
            />
            <View style={styles.switchRow}>
                <Switch value={entrarEnGastos} onValueChange={setEntrarEnGastos} />
                <Text style={styles.switchLabel}>¿Sumar a todos los gastos anteriores?</Text>
            </View>
            <Button
                title="Añadir"
                onPress={agregarPersona}
                disabled={!nombre}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    input: {
        borderBottomWidth: 2,
        borderBottomColor: '#42a5f5',
        marginBottom: 16,
        paddingVertical: 6,
        fontSize: 16,
    },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    switchLabel: { marginLeft: 10, fontSize: 15 },
});
