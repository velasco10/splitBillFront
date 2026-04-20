import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Paletas de color ──────────────────────────────────────────────────────────
export const PALETAS = {
  azul:    { primary: '#42a5f5', dark: '#2563eb', light: '#eff6ff', border: '#bfdbfe' },
  verde:   { primary: '#66bb6a', dark: '#2e7d32', light: '#f0fdf4', border: '#bbf7d0' },
  morado:  { primary: '#ab47bc', dark: '#7b1fa2', light: '#faf5ff', border: '#e9d5ff' },
  naranja: { primary: '#ff7043', dark: '#e64a19', light: '#fff7ed', border: '#fed7aa' },
  rosa:    { primary: '#ec407a', dark: '#c2185b', light: '#fdf2f8', border: '#fbcfe8' },
};

// ── Temas claro/oscuro ────────────────────────────────────────────────────────
const temaClaro = (paleta) => ({
  modo:             'claro',
  fondo:            '#ffffff',
  fondoCard:        '#f8f9fa',
  fondoInput:       'transparent',
  texto:            '#111111',
  textoSecundario:  '#666666',
  textoTerciario:   '#aaaaaa',
  borde:            '#e5e7eb',
  primary:           paleta.primary,
  primaryDark:       paleta.dark,
  primaryLight:      paleta.light,
  primaryBorder:     paleta.border,
  danger:           '#e74c3c',
  success:          '#2ecc71',
  warning:          '#f59e0b',
  inputBorder:       paleta.primary,
});

const temaOscuro = (paleta) => ({
  modo:             'oscuro',
  fondo:            '#0f172a',
  fondoCard:        '#1e293b',
  fondoInput:       'transparent',
  texto:            '#f1f5f9',
  textoSecundario:  '#94a3b8',
  textoTerciario:   '#64748b',
  borde:            '#334155',
  primary:           paleta.primary,
  primaryDark:       paleta.dark,
  primaryLight:      '#1e293b',
  primaryBorder:     '#334155',
  danger:           '#f87171',
  success:          '#4ade80',
  warning:          '#fbbf24',
  inputBorder:       paleta.primary,
});

// ── Context ───────────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [modo, setModo]       = useState('claro');    // 'claro' | 'oscuro'
  const [paleta, setPaleta]   = useState('azul');     // nombre de la paleta

  useEffect(() => {
    cargarTema();
  }, []);

  const cargarTema = async () => {
    try {
      const m = await AsyncStorage.getItem('tema_modo');
      const p = await AsyncStorage.getItem('tema_paleta');
      if (m) setModo(m);
      if (p) setPaleta(p);
    } catch (e) {
      console.error('Error cargando tema:', e);
    }
  };

  const cambiarModo = async (nuevoModo) => {
    setModo(nuevoModo);
    await AsyncStorage.setItem('tema_modo', nuevoModo);
  };

  const cambiarPaleta = async (nuevaPaleta) => {
    setPaleta(nuevaPaleta);
    await AsyncStorage.setItem('tema_paleta', nuevaPaleta);
  };

  const theme = modo === 'oscuro'
    ? temaOscuro(PALETAS[paleta])
    : temaClaro(PALETAS[paleta]);

  return (
    <ThemeContext.Provider value={{ theme, modo, paleta, cambiarModo, cambiarPaleta }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);