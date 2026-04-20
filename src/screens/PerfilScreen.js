import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, AppState, Linking,
  TouchableOpacity, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../utils/authContext';
import { useTheme, PALETAS } from '../utils/themeContext';
import AppBackground from '../components/AppBackground';
import { API_URL } from '../config';

const SCANS_FREE_MES = 5;

export default function PerfilScreen({ navigation }) {
  const { usuario, token, login, logout } = useAuth();
  const { theme, modo, paleta, cambiarModo, cambiarPaleta } = useTheme();
  const [cargandoPago, setCargandoPago] = useState(false);
  const [cancelando, setCancelando]     = useState(false);

  useEffect(() => {
    if (usuario && token) {
      fetch(`${API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json()).then(u => login(token, u)).catch(console.error);
    }
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active' && usuario && token) {
        try {
          const res = await fetch(`${API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) await login(token, await res.json());
        } catch (e) { console.error(e); }
      }
    });
    return () => subscription.remove();
  }, [usuario, token]);

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => logout().then(() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })) }
    ]);
  };

  const handleHacersePremium = async () => {
    if (!usuario) { Alert.alert('Inicia sesión', 'Necesitas una cuenta para suscribirte.'); navigation.navigate('Login'); return; }
    setCargandoPago(true);
    try {
      const res  = await fetch(`${API_URL}/stripe/crear_suscripcion`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error');
      await Linking.openURL(data.url);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setCargandoPago(false); }
  };

  const handleCancelarSuscripcion = () => {
    Alert.alert('Cancelar suscripción', 'Tu plan Premium se mantendrá activo hasta el final del período.', [
      { text: 'Mantener Premium', style: 'cancel' },
      { text: 'Cancelar suscripción', style: 'destructive', onPress: async () => {
        setCancelando(true);
        try {
          const res = await fetch(`${API_URL}/stripe/cancelar`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail);
          Alert.alert('Suscripción cancelada', 'Tu plan seguirá activo hasta el final del período.');
          const resMe = await fetch(`${API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (resMe.ok) await login(token, await resMe.json());
        } catch (e) { Alert.alert('Error', e.message); }
        finally { setCancelando(false); }
      }}
    ]);
  };

  const scansUsados    = usuario?.scans_mes || 0;
  const esPremium      = usuario?.plan === 'premium';
  const scansRestantes = esPremium ? null : SCANS_FREE_MES - scansUsados;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.fondo }]}>
      <ScrollView style={[styles.container, { backgroundColor: theme.fondo }]}>
        <AppBackground>

          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={26} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.texto }]}>Mi perfil</Text>
            <View style={{ width: 26 }} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarArea}>
            <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="person-outline" size={40} color={theme.primary} />
            </View>
            <Text style={[styles.nombre, { color: theme.texto }]}>{usuario?.nombre}</Text>
            <Text style={[styles.email, { color: theme.textoSecundario }]}>{usuario?.email}</Text>
            <View style={[styles.planBadge, { backgroundColor: theme.primaryLight, borderColor: theme.primary }, esPremium && styles.planBadgePremium]}>
              <Ionicons name={esPremium ? 'star' : 'star-outline'} size={14} color={esPremium ? '#fff' : theme.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.planBadgeText, { color: theme.primary }, esPremium && styles.planBadgeTextPremium]}>
                {esPremium ? 'Premium' : 'Plan Free'}
              </Text>
            </View>
          </View>

          {/* Apariencia */}
          <View style={styles.seccion}>
            <Text style={[styles.seccionTitle, { color: theme.texto }]}>Apariencia</Text>
            <View style={[styles.aparienciaCard, { backgroundColor: theme.fondoCard, borderColor: theme.borde }]}>

              {/* Modo claro/oscuro */}
              <Text style={[styles.aparienciaLabel, { color: theme.textoSecundario }]}>Modo</Text>
              <View style={styles.modoRow}>
                {['claro', 'oscuro'].map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.modoOpcion,
                      { backgroundColor: theme.fondo, borderColor: theme.borde },
                      modo === m && { borderColor: theme.primary, backgroundColor: theme.primaryLight }
                    ]}
                    onPress={() => cambiarModo(m)}
                  >
                    <Ionicons
                      name={m === 'claro' ? 'sunny-outline' : 'moon-outline'}
                      size={20}
                      color={modo === m ? theme.primary : theme.textoSecundario}
                    />
                    <Text style={[styles.modoOpcionText, { color: modo === m ? theme.primary : theme.textoSecundario }]}>
                      {m === 'claro' ? 'Claro' : 'Oscuro'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Paleta de color */}
              <Text style={[styles.aparienciaLabel, { color: theme.textoSecundario, marginTop: 14 }]}>Color</Text>
              <View style={styles.paletaRow}>
                {Object.entries(PALETAS).map(([nombre, datos]) => (
                  <TouchableOpacity
                    key={nombre}
                    onPress={() => cambiarPaleta(nombre)}
                    style={[
                      styles.paletaCirculo,
                      { backgroundColor: datos.primary },
                      paleta === nombre && styles.paletaCirculoActivo
                    ]}
                  >
                    {paleta === nombre && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </TouchableOpacity>
                ))}
              </View>

            </View>
          </View>

          {/* Scans */}
          <View style={styles.seccion}>
            <Text style={[styles.seccionTitle, { color: theme.texto }]}>Scans de ticket este mes</Text>
            {esPremium ? (
              <View style={[styles.scansCard, { backgroundColor: theme.fondoCard }]}>
                <Ionicons name="infinite-outline" size={28} color={theme.primary} />
                <Text style={[styles.scansIlimitado, { color: theme.primary }]}>Scans ilimitados</Text>
              </View>
            ) : (
              <View style={[styles.scansCard, { backgroundColor: theme.fondoCard }]}>
                <View style={styles.scansRow}>
                  <Text style={[styles.scansNumero, { color: theme.primaryDark }]}>{scansUsados}</Text>
                  <Text style={[styles.scansDe, { color: theme.textoSecundario }]}>/ {SCANS_FREE_MES}</Text>
                </View>
                <View style={[styles.barraFondo, { backgroundColor: theme.borde }]}>
                  <View style={[styles.barraRelleno, { width: `${Math.min((scansUsados / SCANS_FREE_MES) * 100, 100)}%`, backgroundColor: scansRestantes === 0 ? theme.danger : theme.primary }]} />
                </View>
                <Text style={[styles.scansTexto, { color: theme.textoSecundario }]}>
                  {scansRestantes === 0 ? 'Has agotado tus scans este mes' : `Te quedan ${scansRestantes} scan${scansRestantes !== 1 ? 's' : ''} este mes`}
                </Text>
              </View>
            )}
          </View>

          {/* Plan */}
          <View style={styles.seccion}>
            <Text style={[styles.seccionTitle, { color: theme.texto }]}>Tu plan</Text>

            <View style={[styles.planCard, { backgroundColor: theme.fondoCard, borderColor: theme.borde }, !esPremium && { borderColor: theme.primary, borderWidth: 2 }]}>
              <View style={styles.planHeader}>
                <Text style={[styles.planNombre, { color: theme.texto }]}>Free</Text>
                <Text style={[styles.planPrecio, { color: theme.primaryDark }]}>Gratis</Text>
              </View>
              <Text style={[styles.planFeature, { color: theme.textoSecundario }]}>✓ Hasta 4 grupos</Text>
              <Text style={[styles.planFeature, { color: theme.textoSecundario }]}>✓ Registro de gastos</Text>
              <Text style={[styles.planFeature, { color: theme.textoSecundario }]}>✓ 5 scans de ticket al mes</Text>
              {!esPremium && <View style={[styles.planActualBadge, { backgroundColor: theme.primary }]}><Text style={styles.planActualText}>Plan actual</Text></View>}
            </View>

            <View style={[styles.planCard, { backgroundColor: theme.modo === 'oscuro' ? '#1a1500' : '#fffbeb', borderColor: esPremium ? theme.primary : '#fde68a', borderWidth: esPremium ? 2 : 1 }]}>
              <View style={styles.planHeader}>
                <View style={styles.planNombreRow}>
                  <Ionicons name="star" size={16} color="#f59e0b" style={{ marginRight: 4 }} />
                  <Text style={[styles.planNombre, { color: '#f59e0b' }]}>Premium</Text>
                </View>
                <Text style={[styles.planPrecio, { color: theme.primaryDark }]}>1.99€/mes</Text>
              </View>
              <Text style={[styles.planFeature, { color: theme.textoSecundario }]}>✓ Grupos ilimitados</Text>
              <Text style={[styles.planFeature, { color: theme.textoSecundario }]}>✓ Scans ilimitados</Text>
              <Text style={[styles.planFeature, { color: theme.textoSecundario }]}>✓ Estadísticas avanzadas</Text>
              <Text style={[styles.planFeature, { color: theme.textoSecundario }]}>✓ Plantillas de división</Text>
              <Text style={[styles.planFeature, { color: theme.textoSecundario }]}>✓ Pagos programados</Text>
              <Text style={[styles.planFeature, { color: theme.textoSecundario }]}>✓ Sin anuncios</Text>
              {esPremium ? (
                <>
                  <View style={[styles.planActualBadge, { backgroundColor: theme.primary }]}><Text style={styles.planActualText}>Plan actual</Text></View>
                  <TouchableOpacity style={styles.btnCancelar} onPress={handleCancelarSuscripcion} disabled={cancelando}>
                    {cancelando ? <ActivityIndicator size="small" color={theme.danger} /> : <Text style={[styles.btnCancelarText, { color: theme.danger }]}>Cancelar suscripción</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={[styles.btnPremium, cargandoPago && { opacity: 0.7 }]} onPress={handleHacersePremium} disabled={cargandoPago}>
                  {cargandoPago ? <ActivityIndicator size="small" color="#fff" /> : <><Ionicons name="star" size={16} color="#fff" style={{ marginRight: 6 }} /><Text style={styles.btnPremiumText}>Hazte Premium — 1.99€/mes</Text></>}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Info cuenta */}
          <View style={styles.seccion}>
            <Text style={[styles.seccionTitle, { color: theme.texto }]}>Cuenta</Text>
            <View style={[styles.infoCard, { backgroundColor: theme.fondoCard }]}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color={theme.textoSecundario} />
                <Text style={[styles.infoLabel, { color: theme.textoSecundario }]}>Miembro desde</Text>
                <Text style={[styles.infoValor, { color: theme.texto }]}>
                  {usuario?.creado_en ? new Date(usuario.creado_en).toLocaleDateString('es-ES') : '-'}
                </Text>
              </View>
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity style={[styles.btnLogout, { backgroundColor: theme.modo === 'oscuro' ? '#1a0a0a' : '#fff1f0' }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.danger} style={{ marginRight: 8 }} />
            <Text style={[styles.btnLogoutText, { color: theme.danger }]}>Cerrar sesión</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </AppBackground>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1 },
  container: { flex: 1, padding: 20 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title:     { fontSize: 18, fontWeight: '700' },

  avatarArea: { alignItems: 'center', marginBottom: 28 },
  avatar:     { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  nombre:     { fontSize: 20, fontWeight: '700' },
  email:      { fontSize: 14, marginTop: 4 },
  planBadge:  { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  planBadgePremium:     { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  planBadgeText:        { fontSize: 13, fontWeight: '600' },
  planBadgeTextPremium: { color: '#fff' },

  seccion:      { marginBottom: 24 },
  seccionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

  aparienciaCard:  { borderRadius: 14, padding: 16, borderWidth: 1 },
  aparienciaLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  modoRow:         { flexDirection: 'row', gap: 10 },
  modoOpcion:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 10, borderWidth: 1.5 },
  modoOpcionText:  { fontSize: 14, fontWeight: '600' },
  paletaRow:       { flexDirection: 'row', gap: 10, marginTop: 4 },
  paletaCirculo:      { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  paletaCirculoActivo:{ borderWidth: 3, borderColor: '#fff', elevation: 4 },

  scansCard:      { borderRadius: 12, padding: 16, alignItems: 'center' },
  scansRow:       { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
  scansNumero:    { fontSize: 36, fontWeight: 'bold' },
  scansDe:        { fontSize: 18, marginLeft: 4 },
  barraFondo:     { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  barraRelleno:   { height: 8, borderRadius: 4 },
  scansTexto:     { fontSize: 13 },
  scansIlimitado: { fontSize: 16, fontWeight: '600', marginTop: 8 },

  planCard:        { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1 },
  planHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  planNombreRow:   { flexDirection: 'row', alignItems: 'center' },
  planNombre:      { fontSize: 16, fontWeight: '700' },
  planPrecio:      { fontSize: 15, fontWeight: '700' },
  planFeature:     { fontSize: 13, marginBottom: 4 },
  planActualBadge: { marginTop: 10, borderRadius: 8, padding: 6, alignItems: 'center' },
  planActualText:  { color: '#fff', fontSize: 12, fontWeight: '700' },

  btnPremium:     { marginTop: 12, backgroundColor: '#f59e0b', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnPremiumText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnCancelar:    { marginTop: 10, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5' },
  btnCancelarText:{ fontSize: 13, fontWeight: '600' },

  infoCard:  { borderRadius: 12, padding: 14 },
  infoRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { flex: 1, fontSize: 14 },
  infoValor: { fontSize: 14, fontWeight: '600' },

  btnLogout:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#fca5a5' },
  btnLogoutText: { fontWeight: '700', fontSize: 15 },
});