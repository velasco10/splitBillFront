import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppBackground from '../components/AppBackground';

export default function AsignarProductosScreen({ route, navigation }) {
  const { lineas, personas, grupo } = route.params;

  const [asignaciones, setAsignaciones] = useState(
    lineas.map(() => [])
  );

  const volverAlHome = () => navigation.reset({
    index: 0,
    routes: [{ name: 'Home' }],
  });

  const togglePersona = (prodIdx, persona) => {
    setAsignaciones(prev => prev.map((arr, i) =>
      i === prodIdx
        ? arr.includes(persona)
          ? arr.filter(p => p !== persona)
          : [...arr, persona]
        : arr
    ));
  };

  const toggleTodos = (prodIdx) => {
    setAsignaciones(prev => prev.map((arr, i) => {
      if (i !== prodIdx) return arr;
      return arr.length === personas.length ? [] : [...personas];
    }));
  };

  const handleAceptar = () => {
    const resultado = lineas.map((prod, i) => ({
      ...prod,
      personas: asignaciones[i],
    }));
    navigation.navigate('TotalesPorPersona', { productos: resultado, personas, grupo });
  };

  const totalAsignado = asignaciones.filter(a => a.length > 0).length;
  const puedeAceptar  = totalAsignado === lineas.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppBackground>

          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={26} color="#42a5f5" />
            </TouchableOpacity>
            <Text style={styles.title}>Asignar productos</Text>
            <TouchableOpacity onPress={volverAlHome}>
              <Ionicons name="home-outline" size={26} color="#42a5f5" />
            </TouchableOpacity>
          </View>

          {/* Progreso */}
          <View style={styles.progreso}>
            <Text style={styles.progresoText}>
              {totalAsignado} de {lineas.length} productos asignados
            </Text>
            <View style={styles.barraFondo}>
              <View style={[
                styles.barraRelleno,
                { width: `${(totalAsignado / lineas.length) * 100}%` }
              ]} />
            </View>
          </View>

          <FlatList
            data={lineas}
            keyExtractor={(item, idx) => `${item.producto}-${idx}`}
            renderItem={({ item, index }) => {
              const asignados = asignaciones[index];
              const todosAsignados = asignados.length === personas.length;
              return (
                <View style={[
                  styles.productoCard,
                  asignados.length > 0 && styles.productoCardAsignado
                ]}>
                  <View style={styles.productoHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productoNombre}>{item.producto}</Text>
                      <Text style={styles.productoImporte}>{item.importe} €</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.btnTodos}
                      onPress={() => toggleTodos(index)}
                    >
                      <Text style={styles.btnTodosText}>
                        {todosAsignados ? 'Ninguno' : 'Todos'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.personasRow}>
                    {personas.map(persona => (
                      <TouchableOpacity
                        key={persona}
                        style={[
                          styles.personaBtn,
                          asignados.includes(persona) && styles.personaBtnActivo
                        ]}
                        onPress={() => togglePersona(index, persona)}
                      >
                        <Ionicons
                          name={asignados.includes(persona) ? 'checkmark-circle' : 'person-outline'}
                          size={14}
                          color={asignados.includes(persona) ? '#fff' : '#555'}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={[
                          styles.personaBtnText,
                          asignados.includes(persona) && styles.personaBtnTextActivo
                        ]}>
                          {persona}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            }}
          />

          {/* Botón aceptar */}
          <TouchableOpacity
            style={[styles.btnAceptar, !puedeAceptar && styles.btnDesactivado]}
            onPress={handleAceptar}
            disabled={!puedeAceptar}
          >
            <Text style={styles.btnAceptarText}>
              {puedeAceptar ? 'Ver totales' : `Faltan ${lineas.length - totalAsignado} productos`}
            </Text>
            <Ionicons name="arrow-forward-outline" size={18} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111' },

  progreso:      { marginBottom: 16 },
  progresoText:  { fontSize: 13, color: '#888', marginBottom: 6 },
  barraFondo:    { height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, overflow: 'hidden' },
  barraRelleno:  { height: 6, backgroundColor: '#42a5f5', borderRadius: 3 },

  productoCard: {
    backgroundColor: '#f8f9fa', borderRadius: 12,
    padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  productoCardAsignado: { borderColor: '#42a5f5', backgroundColor: '#f0f7ff' },
  productoHeader:       { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  productoNombre:       { fontSize: 15, fontWeight: '600', color: '#111' },
  productoImporte:      { fontSize: 13, color: '#2563eb', marginTop: 2 },

  btnTodos:     { backgroundColor: '#e0e7ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  btnTodosText: { fontSize: 12, color: '#2563eb', fontWeight: '600' },

  personasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  personaBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#e5e7eb',
  },
  personaBtnActivo:     { backgroundColor: '#42a5f5' },
  personaBtnText:       { fontSize: 13, color: '#555' },
  personaBtnTextActivo: { color: '#fff', fontWeight: '600' },

  btnAceptar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#42a5f5', borderRadius: 12,
    padding: 16, marginTop: 16, marginBottom: 20,
  },
  btnDesactivado: { backgroundColor: '#b0d4f1' },
  btnAceptarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});