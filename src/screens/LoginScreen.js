import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import { useAuth } from '../utils/authContext';
import AppBackground from '../components/AppBackground';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [modo, setModo]         = useState('login'); // 'login' | 'registro'
  const [nombre, setNombre]     = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);

  const validar = () => {
    if (modo === 'registro' && !nombre.trim()) {
      Alert.alert('Error', 'Introduce tu nombre');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Introduce un email válido');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validar()) return;
    setCargando(true);
    try {
      const endpoint = modo === 'login' ? '/auth/login' : '/auth/registro';
      const body = modo === 'login'
        ? { email, password }
        : { nombre, email, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Error al iniciar sesión');
      }

      await login(data.token, data.usuario);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <AppBackground>
            <View style={styles.container}>

              {/* Header */}
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back-outline" size={26} color="#42a5f5" />
                </TouchableOpacity>
              </View>

              {/* Logo / título */}
              <View style={styles.logoArea}>
                <Ionicons name="wallet-outline" size={56} color="#42a5f5" />
                <Text style={styles.appNombre}>SplitBill</Text>
                <Text style={styles.appSub}>Divide gastos sin complicaciones</Text>
              </View>

              {/* Selector login / registro */}
              <View style={styles.modoRow}>
                <TouchableOpacity
                  style={[styles.modoBtn, modo === 'login' && styles.modoBtnActivo]}
                  onPress={() => setModo('login')}
                >
                  <Text style={[styles.modoBtnText, modo === 'login' && styles.modoBtnTextActivo]}>
                    Iniciar sesión
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modoBtn, modo === 'registro' && styles.modoBtnActivo]}
                  onPress={() => setModo('registro')}
                >
                  <Text style={[styles.modoBtnText, modo === 'registro' && styles.modoBtnTextActivo]}>
                    Registrarse
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Formulario */}
              {modo === 'registro' && (
                <>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    placeholder="Tu nombre"
                    placeholderTextColor="#6B7280"
                    style={styles.input}
                    value={nombre}
                    onChangeText={setNombre}
                    autoCapitalize="words"
                  />
                </>
              )}

              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="tu@email.com"
                placeholderTextColor="#6B7280"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passRow}>
                <TextInput
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#6B7280"
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!mostrarPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setMostrarPass(!mostrarPass)}
                  style={styles.passToggle}
                >
                  <Ionicons
                    name={mostrarPass ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>

              {/* Botón submit */}
              <TouchableOpacity
                style={[styles.btnSubmit, cargando && styles.btnDesactivado]}
                onPress={handleSubmit}
                disabled={cargando}
              >
                {cargando
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnSubmitText}>
                      {modo === 'login' ? 'Entrar' : 'Crear cuenta'}
                    </Text>
                }
              </TouchableOpacity>

              {/* Info plan */}
              {modo === 'registro' && (
                <View style={styles.planInfo}>
                  <Ionicons name="information-circle-outline" size={16} color="#888" />
                  <Text style={styles.planInfoText}>
                    La cuenta gratuita incluye 5 scans de ticket al mes.
                    Puedes usar la app sin cuenta con el mismo límite.
                  </Text>
                </View>
              )}

              {/* Continuar sin cuenta */}
              <TouchableOpacity
                style={styles.btnSinCuenta}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.btnSinCuentaText}>Continuar sin cuenta</Text>
              </TouchableOpacity>

            </View>
          </AppBackground>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 24 },

  headerRow: { marginBottom: 8 },

  logoArea:  { alignItems: 'center', marginBottom: 32, marginTop: 8 },
  appNombre: { fontSize: 28, fontWeight: 'bold', color: '#2563eb', marginTop: 12 },
  appSub:    { fontSize: 14, color: '#888', marginTop: 4 },

  modoRow: {
    flexDirection: 'row', backgroundColor: '#f0f0f0',
    borderRadius: 12, padding: 4, marginBottom: 24,
  },
  modoBtn:          { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center' },
  modoBtnActivo:    { backgroundColor: '#fff', elevation: 2 },
  modoBtnText:      { fontSize: 14, color: '#888', fontWeight: '500' },
  modoBtnTextActivo: { color: '#2563eb', fontWeight: '700' },

  label: { fontWeight: '600', fontSize: 14, color: '#333', marginBottom: 6, marginTop: 12 },
  input: {
    borderBottomWidth: 2, borderBottomColor: '#42a5f5',
    marginBottom: 4, paddingVertical: 8,
    fontSize: 16, color: '#111',
  },

  passRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  passToggle: { paddingHorizontal: 8, paddingVertical: 8 },

  btnSubmit: {
    backgroundColor: '#42a5f5', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 28,
  },
  btnDesactivado: { backgroundColor: '#b0d4f1' },
  btnSubmitText:  { color: '#fff', fontWeight: '700', fontSize: 16 },

  planInfo: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#f8f9fa', borderRadius: 10,
    padding: 12, marginTop: 16, gap: 8,
  },
  planInfoText: { flex: 1, fontSize: 12, color: '#888', lineHeight: 18 },

  btnSinCuenta:     { alignItems: 'center', marginTop: 20, padding: 10 },
  btnSinCuentaText: { fontSize: 14, color: '#888', textDecorationLine: 'underline' },
});