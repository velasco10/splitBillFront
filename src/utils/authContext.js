import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken]     = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarSesion();
  }, []);

  const cargarSesion = async () => {
    try {
      const t = await AsyncStorage.getItem('token');
      const u = await AsyncStorage.getItem('usuario');
      if (t && u) {
        setToken(t);
        setUsuario(JSON.parse(u));
      }
    } catch (e) {
      console.error('Error cargando sesión:', e);
    } finally {
      setCargando(false);
    }
  };

  const login = async (token, usuario) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
    setToken(token);
    setUsuario(usuario);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);