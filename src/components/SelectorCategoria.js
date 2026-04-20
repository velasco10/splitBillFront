import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/themeContext';
import { API_URL } from '../config';

const CATEGORIAS_BASE = [
  { id: 'alquiler',     label: 'Alquiler',    icon: 'home-outline',            color: '#42a5f5' },
  { id: 'luz',          label: 'Luz',          icon: 'flash-outline',           color: '#ffa726' },
  { id: 'agua',         label: 'Agua',         icon: 'water-outline',           color: '#29b6f6' },
  { id: 'internet',     label: 'Internet',     icon: 'wifi-outline',            color: '#66bb6a' },
  { id: 'alimentacion', label: 'Alimentación', icon: 'cart-outline',            color: '#ef5350' },
  { id: 'limpieza',     label: 'Limpieza',     icon: 'sparkles-outline',        color: '#ab47bc' },
  { id: 'transporte',   label: 'Transporte',   icon: 'car-outline',             color: '#26a69a' },
  { id: 'ocio',         label: 'Ocio',         icon: 'game-controller-outline', color: '#ec407a' },
  { id: 'salud',        label: 'Salud',        icon: 'medkit-outline',          color: '#ef5350' },
  { id: 'otros',        label: 'Otros',        icon: 'receipt-outline',         color: '#888'    },
];

export function getIconoCategoria(id = '') {
  return CATEGORIAS_BASE.find(c => c.id === id.toLowerCase()) || { icon: 'receipt-outline', color: '#888' };
}

export default function SelectorCategoria({ grupoId, value, onChange }) {
  const { theme } = useTheme();
  const [categoriasGrupo, setCategoriasGrupo] = useState([]);

  useEffect(() => {
    if (grupoId) fetchCategoriasGrupo();
  }, [grupoId]);

  const fetchCategoriasGrupo = async () => {
    try {
      const res  = await fetch(`${API_URL}/gastos/grupo/${grupoId}`);
      if (!res.ok) return;
      const gastos = await res.json();
      // Extraer categorías únicas ya usadas en el grupo
      const usadas = [...new Set(
        gastos
          .map(g => g.categoria?.toLowerCase().trim())
          .filter(c => c && c !== 'otros' && c !== 'ajuste')
      )];
      setCategoriasGrupo(usadas);
    } catch (e) { console.error(e); }
  };

  // Sugerencias: primero las del grupo, luego las base que no estén ya
  const idsGrupo   = new Set(categoriasGrupo);
  const baseExtras = CATEGORIAS_BASE.filter(c => !idsGrupo.has(c.id) && c.id !== 'otros');
  const sugerencias = [
    ...categoriasGrupo.map(id => {
      const base = CATEGORIAS_BASE.find(c => c.id === id);
      return base || { id, label: id.charAt(0).toUpperCase() + id.slice(1), icon: 'receipt-outline', color: '#888' };
    }),
    ...baseExtras,
  ];

  return (
    <View>
      <TextInput
        placeholder="Ej: alquiler, luz, alimentación..."
        placeholderTextColor={theme.textoTerciario}
        style={[styles.input, { borderBottomColor: theme.primary, color: theme.texto }]}
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
      />

      {/* Chips de sugerencias */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        {sugerencias.map(cat => {
          const activa = value?.toLowerCase() === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                { backgroundColor: theme.fondoCard, borderColor: theme.borde },
                activa && { backgroundColor: cat.color + '20', borderColor: cat.color }
              ]}
              onPress={() => onChange(activa ? '' : cat.id)}
            >
              <Ionicons name={cat.icon} size={13} color={activa ? cat.color : theme.textoSecundario} style={{ marginRight: 4 }} />
              <Text style={[styles.chipText, { color: activa ? cat.color : theme.textoSecundario }, activa && { fontWeight: '600' }]}>
                {cat.label || cat.id}
              </Text>
              {activa && (
                <Ionicons name="close-circle" size={13} color={cat.color} style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  input:       { borderBottomWidth: 2, marginBottom: 8, paddingVertical: 6, fontSize: 16, backgroundColor: 'transparent' },
  chipsScroll: { marginBottom: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
    marginRight: 8, marginBottom: 4,
  },
  chipText: { fontSize: 12 },
});