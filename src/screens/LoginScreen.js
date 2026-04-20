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
import { useTheme } from '../utils/themeContext';

export default function LoginScreen({ navigation }) {
  const { login }  = useAuth();
  const { theme }  = useTheme();
  const [modo, setModo]               = useState('login');
  const [nombre, setNombre]           = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando]       = useState(false);

  const validar = () => {
    if (modo === 'registro' && !nombre.trim()) { Alert.alert('Error', 'Introduce tu nombre'); return false; }
    if (!email.trim() || !email.includes('@')) { Alert.alert('Error', 'Introduce un email válido'); return false; }
    if (password.length < 6) { Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validar()) return;
    setCargando(true);
    try {
      const endpoint = modo === 'login' ? '/auth/login' : '/auth/registro';
      const body     = modo === 'login' ? { email, password } : { nombre, email, password };
      const res      = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data     = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al iniciar sesión');
      await login(data.token, data.usuario);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setCargando(false); }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <AppBackground>
            <View style={styles.container}>

              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back-outline" size={26} color={theme.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.logoArea}>
                <Ionicons name="wallet-outline" size={56} color={theme.primary} />
                <Text style={[styles.appNombre, { color: theme.primaryDark }]}>Billary</Text>
                <Text style={[styles.appSub, { color: theme.textoSecundario }]}>Divide gastos sin complicaciones</Text>
              </View>

              <View style={[styles.modoRow, { backgroundColor: theme.fondoCard }]}>
                {['login', 'registro'].map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.modoBtn, modo === m && { backgroundColor: theme.fondo, elevation: 2 }]}
                    onPress={() => setModo(m)}
                  >
                    <Text style={[styles.modoBtnText, { color: theme.textoSecundario }, modo === m && { color: theme.primaryDark, fontWeight: '700' }]}>
                      {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {modo === 'registro' && (
                <>
                  <Text style={[styles.label, { color: theme.texto }]}>Nombre</Text>
                  <TextInput
                    placeholder="Tu nombre" placeholderTextColor={theme.textoTerciario}
                    style={[styles.input, { borderBottomColor: theme.primary, color: theme.texto }]}
                    value={nombre} onChangeText={setNombre} autoCapitalize="words"
                  />
                </>
              )}

              <Text style={[styles.label, { color: theme.texto }]}>Email</Text>
              <TextInput
                placeholder="tu@email.com" placeholderTextColor={theme.textoTerciario}
                style={[styles.input, { borderBottomColor: theme.primary, color: theme.texto }]}
                value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              />

              <Text style={[styles.label, { color: theme.texto }]}>Contraseña</Text>
              <View style={styles.passRow}>
                <TextInput
                  placeholder="Mínimo 6 caracteres" placeholderTextColor={theme.textoTerciario}
                  style={[styles.input, { flex: 1, marginBottom: 0, borderBottomColor: theme.primary, color: theme.texto }]}
                  value={password} onChangeText={setPassword} secureTextEntry={!mostrarPass} autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setMostrarPass(!mostrarPass)} style={styles.passToggle}>
                  <Ionicons name={mostrarPass ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.textoSecundario} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.btnSubmit, { backgroundColor: theme.primary }, cargando && { backgroundColor: theme.primaryBorder }]}
                onPress={handleSubmit} disabled={cargando}
              >
                {cargando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSubmitText}>{modo === 'login' ? 'Entrar' : 'Crear cuenta'}</Text>}
              </TouchableOpacity>

              {modo === 'registro' && (
                <View style={[styles.planInfo, { backgroundColor: theme.fondoCard }]}>
                  <Ionicons name="information-circle-outline" size={16} color={theme.textoSecundario} />
                  <Text style={[styles.planInfoText, { color: theme.textoSecundario }]}>
                    La cuenta gratuita incluye 5 scans de ticket al mes. Puedes usar la app sin cuenta con el mismo límite.
                  </Text>
                </View>
              )}

              <TouchableOpacity style={styles.btnSinCuenta} onPress={() => navigation.goBack()}>
                <Text style={[styles.btnSinCuentaText, { color: theme.textoSecundario }]}>Continuar sin cuenta</Text>
              </TouchableOpacity>

            </View>
          </AppBackground>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:   { flex: 1 },
  container:  { flex: 1, padding: 24 },
  headerRow:  { marginBottom: 8 },
  logoArea:   { alignItems: 'center', marginBottom: 32, marginTop: 8 },
  appNombre:  { fontSize: 28, fontWeight: 'bold', marginTop: 12 },
  appSub:     { fontSize: 14, marginTop: 4 },
  modoRow:    { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 24 },
  modoBtn:    { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center' },
  modoBtnText:{ fontSize: 14, fontWeight: '500' },
  label:      { fontWeight: '600', fontSize: 14, marginBottom: 6, marginTop: 12 },
  input:      { borderBottomWidth: 2, marginBottom: 4, paddingVertical: 8, fontSize: 16 },
  passRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  passToggle: { paddingHorizontal: 8, paddingVertical: 8 },
  btnSubmit:     { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 28 },
  btnSubmitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  planInfo:      { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 10, padding: 12, marginTop: 16, gap: 8 },
  planInfoText:  { flex: 1, fontSize: 12, lineHeight: 18 },
  btnSinCuenta:     { alignItems: 'center', marginTop: 20, padding: 10 },
  btnSinCuentaText: { fontSize: 14, textDecorationLine: 'underline' },
});