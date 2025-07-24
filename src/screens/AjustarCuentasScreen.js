import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { API_URL } from '../config';
import { Ionicons } from '@expo/vector-icons';

function simplificarPagos(saldos) {
    const positivos = [];
    const negativos = [];

    for (const persona in saldos) {
        const saldo = parseFloat(saldos[persona].toFixed(2));
        if (saldo > 0.01) positivos.push({ persona, saldo });
        if (saldo < -0.01) negativos.push({ persona, saldo });
    }

    const pagos = [];

    while (positivos.length && negativos.length) {
        const acreedor = positivos[0];
        const deudor = negativos[0];

        const monto = Math.min(acreedor.saldo, -deudor.saldo);

        pagos.push({
            de: deudor.persona,
            a: acreedor.persona,
            monto: monto.toFixed(2),
        });

        acreedor.saldo -= monto;
        deudor.saldo += monto;

        if (acreedor.saldo < 0.01) positivos.shift();
        if (deudor.saldo > -0.01) negativos.shift();
    }

    return pagos;
}

export default function AjustarCuentasScreen({ route, navigation }) {
    const { grupo, saldos } = route.params;
    const pagos = simplificarPagos(saldos);
    const [seleccionados, setSeleccionados] = useState([]);

    const toggleSeleccion = (index) => {
        if (seleccionados.includes(index)) {
            setSeleccionados(seleccionados.filter(i => i !== index));
        } else {
            setSeleccionados([...seleccionados, index]);
        }
    };
    const registrarPagosSeleccionados = async () => {
        for (const i of seleccionados) {
            const pago = pagos[i];
            await fetch(`${API_URL}/gastos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grupoId: grupo._id,
                    concepto: 'Ajuste de cuentas',
                    emisor: pago.de,
                    importe: parseFloat(pago.monto),
                    beneficiarios: [pago.a],
                }),
            });
        }
        setSeleccionados([]);
        navigation.goBack();
    };
    

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pagos para ajustar cuentas:</Text>
            {pagos.length === 0 ? (
                <Text style={styles.noDebt}>No hay deudas pendientes</Text>
            ) : (
                <FlatList
                    data={pagos}
                    keyExtractor={(item, idx) => idx.toString()}
                    renderItem={({ item, index }) => (
                        <View style={[
                            styles.card,
                            seleccionados.includes(index) && { backgroundColor: '#e0f7fa' }
                        ]}>
                            <Ionicons name="cash-outline" size={24} color="#42a5f5" style={{ marginRight: 10 }} />
<Text style={styles.cardText}>
                                <Text style={styles.nombre}>{item.de}</Text> → <Text style={styles.nombre}>{item.a}</Text> por <Text style={styles.monto}>{item.monto}€</Text>
                            </Text>
                            <TouchableOpacity onPress={() => toggleSeleccion(index)}>
                                <Ionicons
                                    name={seleccionados.includes(index) ? 'checkmark-circle' : 'arrow-forward-circle'}
                                    size={28}
                                    color={seleccionados.includes(index) ? '#4caf50' : '#ccc'}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                />


            )}
            <Button
                title="Guardar pagos"
                onPress={registrarPagosSeleccionados}
                disabled={seleccionados.length === 0}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    noDebt: { fontSize: 16, color: '#666' },
    item: { fontSize: 16, marginVertical: 6 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 12,
        marginVertical: 6,
        borderRadius: 8,
        elevation: 1,
    },
    cardText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    nombre: {
        fontWeight: 'bold',
        color: '#000',
    },
    monto: {
        fontWeight: 'bold',
        color: '#42a5f5',
    },
});
