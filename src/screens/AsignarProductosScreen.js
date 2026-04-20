import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppBackground from '../components/AppBackground';
import { useTheme } from '../utils/themeContext';

export default function AsignarProductosScreen({ route, navigation }) {
  const { lineas, personas, grupo } = route.params;
  const { theme } = useTheme();
  const [asignaciones, setAsignaciones] = useState(lineas.map(() => []));

  const volverAlHome = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  const togglePersona = (prodIdx, persona) => {
    setAsignaciones(prev => prev.map((arr, i) =>
      i === prodIdx ? arr.includes(persona) ? arr.filter(p => p !== persona) : [...arr, persona] : arr
    ));
  };

  const toggleTodos = (prodIdx) => {
    setAsignaciones(prev => prev.map((arr, i) => {
      if (i !== prodIdx) return arr;
      return arr.length === personas.length ? [] : [...personas];
    }));
  };

  const handleAceptar = () => {
    const resultado = lineas.map((prod, i) => ({ ...prod, personas: asignaciones[i] }));
    navigation.navigate('TotalesPorPersona', { productos: resultado, personas, grupo });
  };

  const totalAsignado = asignaciones.filter(a => a.length > 0).length;
  const puedeAceptar  = totalAsignado === lineas.length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <View style={[styles.container, { backgroundColor: theme.fondo }]}>
        <AppBackground>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={26} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.texto }]}>Asignar productos</Text>
            <TouchableOpacity onPress={volverAlHome}>
              <Ionicons name="home-outline" size={26} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.progreso}>
            <Text style={[styles.progresoText, { color: theme.textoSecundario }]}>
              {totalAsignado} de {lineas.length} productos asignados
            </Text>
            <View style={[styles.barraFondo, { backgroundColor: theme.borde }]}>
              <View style={[styles.barraRelleno, { width: `${(totalAsignado / lineas.length) * 100}%`, backgroundColor: theme.primary }]} />
            </View>
          </View>

          <FlatList
            data={lineas}
            keyExtractor={(item, idx) => `${item.producto}-${idx}`}
            renderItem={({ item, index }) => {
              const asignados      = asignaciones[index];
              const todosAsignados = asignados.length === personas.length;
              return (
                <View style={[
                  styles.productoCard, { backgroundColor: theme.fondoCard, borderColor: theme.borde },
                  asignados.length > 0 && { borderColor: theme.primary, backgroundColor: theme.primaryLight }
                ]}>
                  <View style={styles.productoHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.productoNombre, { color: theme.texto }]}>{item.producto}</Text>
                      <Text style={[styles.productoImporte, { color: theme.primaryDark }]}>{item.importe} €</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.btnTodos, { backgroundColor: theme.primaryLight }]}
                      onPress={() => toggleTodos(index)}
                    >
                      <Text style={[styles.btnTodosText, { color: theme.primaryDark }]}>
                        {todosAsignados ? 'Ninguno' : 'Todos'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.personasRow}>
                    {personas.map(persona => (
                      <TouchableOpacity
                        key={persona}
                        style={[
                          styles.personaBtn, { backgroundColor: theme.borde },
                          asignados.includes(persona) && { backgroundColor: theme.primary }
                        ]}
                        onPress={() => togglePersona(index, persona)}
                      >
                        <Ionicons
                          name={asignados.includes(persona) ? 'checkmark-circle' : 'person-outline'}
                          size={14}
                          color={asignados.includes(persona) ? '#fff' : theme.textoSecundario}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.personaBtnText, { color: theme.textoSecundario }, asignados.includes(persona) && { color: '#fff', fontWeight: '600' }]}>
                          {persona}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            }}
          />

          <TouchableOpacity
            style={[styles.btnAceptar, { backgroundColor: theme.primary }, !puedeAceptar && { backgroundColor: theme.primaryBorder }]}
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
  safeArea:  { flex: 1 },
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title:     { fontSize: 20, fontWeight: 'bold' },
  progreso:      { marginBottom: 16 },
  progresoText:  { fontSize: 13, marginBottom: 6 },
  barraFondo:    { height: 6, borderRadius: 3, overflow: 'hidden' },
  barraRelleno:  { height: 6, borderRadius: 3 },
  productoCard:  { borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1 },
  productoHeader:{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  productoNombre:{ fontSize: 15, fontWeight: '600' },
  productoImporte:{ fontSize: 13, marginTop: 2 },
  btnTodos:      { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  btnTodosText:  { fontSize: 12, fontWeight: '600' },
  personasRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  personaBtn:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  personaBtnText:{ fontSize: 13 },
  btnAceptar:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 16, marginTop: 16, marginBottom: 20 },
  btnAceptarText:{ color: '#fff', fontWeight: '700', fontSize: 16 },
});