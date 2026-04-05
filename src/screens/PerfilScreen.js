import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../utils/authContext';
import AppBackground from '../components/AppBackground';
import { API_URL } from '../config';

const SCANS_FREE_MES = 5;

export default function PerfilScreen({ navigation }) {
  const { usuario, token, login, logout } = useAuth();

  useEffect(() => {
    if (usuario && token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(u => login(token, u))
        .catch(console.error);
    }
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            logout().then(() => {
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            });
          }
        }
      ]
    );
  };

  const scansUsados    = usuario?.scans_mes || 0;
  const esPremium      = usuario?.plan === 'premium';
  const scansRestantes = esPremium ? null : SCANS_FREE_MES - scansUsados;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <AppBackground>

          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={26} color="#42a5f5" />
            </TouchableOpacity>
            <Text style={styles.title}>Mi perfil</Text>
            <View style={{ width: 26 }} />
          </View>

          {/* Avatar y datos */}
          <View style={styles.avatarArea}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={40} color="#42a5f5" />
            </View>
            <Text style={styles.nombre}>{usuario?.nombre}</Text>
            <Text style={styles.email}>{usuario?.email}</Text>
            <View style={[styles.planBadge, esPremium && styles.planBadgePremium]}>
              <Ionicons
                name={esPremium ? 'star' : 'star-outline'}
                size={14}
                color={esPremium ? '#fff' : '#42a5f5'}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.planBadgeText, esPremium && styles.planBadgeTextPremium]}>
                {esPremium ? 'Premium' : 'Plan Free'}
              </Text>
            </View>
          </View>

          {/* Scans del mes */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitle}>Scans de ticket este mes</Text>
            {esPremium ? (
              <View style={styles.scansCard}>
                <Ionicons name="infinite-outline" size={28} color="#42a5f5" />
                <Text style={styles.scansIlimitado}>Scans ilimitados</Text>
              </View>
            ) : (
              <View style={styles.scansCard}>
                <View style={styles.scansRow}>
                  <Text style={styles.scansNumero}>{scansUsados}</Text>
                  <Text style={styles.scansDe}>/ {SCANS_FREE_MES}</Text>
                </View>
                <View style={styles.barraFondo}>
                  <View style={[
                    styles.barraRelleno,
                    { width: `${Math.min((scansUsados / SCANS_FREE_MES) * 100, 100)}%` },
                    scansRestantes === 0 && { backgroundColor: '#e74c3c' }
                  ]} />
                </View>
                <Text style={styles.scansTexto}>
                  {scansRestantes === 0
                    ? 'Has agotado tus scans este mes'
                    : `Te quedan ${scansRestantes} scan${scansRestantes !== 1 ? 's' : ''} este mes`}
                </Text>
              </View>
            )}
          </View>

          {/* Plan actual */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitle}>Tu plan</Text>

            {/* Free */}
            <View style={[styles.planCard, !esPremium && styles.planCardActivo]}>
              <View style={styles.planHeader}>
                <Text style={styles.planNombre}>Free</Text>
                <Text style={styles.planPrecio}>Gratis</Text>
              </View>
              <Text style={styles.planFeature}>✓ Grupos ilimitados</Text>
              <Text style={styles.planFeature}>✓ Registro de gastos</Text>
              <Text style={styles.planFeature}>✓ Estadísticas básicas</Text>
              <Text style={styles.planFeature}>✓ 5 scans de ticket al mes</Text>
              {!esPremium && (
                <View style={styles.planActualBadge}>
                  <Text style={styles.planActualText}>Plan actual</Text>
                </View>
              )}
            </View>

            {/* Premium */}
            <View style={[styles.planCard, styles.planCardPremium, esPremium && styles.planCardActivo]}>
              <View style={styles.planHeader}>
                <View style={styles.planNombreRow}>
                  <Ionicons name="star" size={16} color="#f59e0b" style={{ marginRight: 4 }} />
                  <Text style={[styles.planNombre, { color: '#f59e0b' }]}>Premium</Text>
                </View>
                <Text style={styles.planPrecio}>1.99€/mes</Text>
              </View>
              <Text style={styles.planFeature}>✓ Todo lo del plan Free</Text>
              <Text style={styles.planFeature}>✓ Scans ilimitados</Text>
              <Text style={styles.planFeature}>✓ Sin anuncios</Text>
              <Text style={styles.planFeature}>✓ Estadísticas avanzadas</Text>
              <Text style={styles.planFeature}>✓ Pagos programados (próximamente)</Text>

              {esPremium ? (
                <View style={styles.planActualBadge}>
                  <Text style={styles.planActualText}>Plan actual</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.btnPremium}
                  onPress={() => Alert.alert('Próximamente', 'El pago con Stripe estará disponible pronto.')}
                >
                  <Text style={styles.btnPremiumText}>Hazte Premium</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Info cuenta */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitle}>Cuenta</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color="#888" />
                <Text style={styles.infoLabel}>Miembro desde</Text>
                <Text style={styles.infoValor}>
                  {usuario?.creado_en
                    ? new Date(usuario.creado_en).toLocaleDateString('es-ES')
                    : '-'}
                </Text>
              </View>
            </View>
          </View>

          {/* Cerrar sesión */}
          <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#e74c3c" style={{ marginRight: 8 }} />
            <Text style={styles.btnLogoutText}>Cerrar sesión</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />

        </AppBackground>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },

  avatarArea: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#eff6ff', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
  },
  nombre:           { fontSize: 20, fontWeight: '700', color: '#111' },
  email:            { fontSize: 14, color: '#888', marginTop: 4 },
  planBadge: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 10, paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, backgroundColor: '#eff6ff',
    borderWidth: 1, borderColor: '#42a5f5',
  },
  planBadgePremium:     { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  planBadgeText:        { fontSize: 13, color: '#42a5f5', fontWeight: '600' },
  planBadgeTextPremium: { color: '#fff' },

  seccion:      { marginBottom: 24 },
  seccionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },

  scansCard:      { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, alignItems: 'center' },
  scansRow:       { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
  scansNumero:    { fontSize: 36, fontWeight: 'bold', color: '#2563eb' },
  scansDe:        { fontSize: 18, color: '#888', marginLeft: 4 },
  barraFondo:     { width: '100%', height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  barraRelleno:   { height: 8, backgroundColor: '#42a5f5', borderRadius: 4 },
  scansTexto:     { fontSize: 13, color: '#888' },
  scansIlimitado: { fontSize: 16, fontWeight: '600', color: '#42a5f5', marginTop: 8 },

  planCard:        { backgroundColor: '#f8f9fa', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  planCardActivo:  { borderColor: '#42a5f5', borderWidth: 2 },
  planCardPremium: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  planHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  planNombreRow:   { flexDirection: 'row', alignItems: 'center' },
  planNombre:      { fontSize: 16, fontWeight: '700', color: '#111' },
  planPrecio:      { fontSize: 15, fontWeight: '700', color: '#2563eb' },
  planFeature:     { fontSize: 13, color: '#555', marginBottom: 4 },
  planActualBadge: { marginTop: 10, backgroundColor: '#42a5f5', borderRadius: 8, padding: 6, alignItems: 'center' },
  planActualText:  { color: '#fff', fontSize: 12, fontWeight: '700' },

  btnPremium:     { marginTop: 12, backgroundColor: '#f59e0b', borderRadius: 10, padding: 12, alignItems: 'center' },
  btnPremiumText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  infoCard:  { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14 },
  infoRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { flex: 1, fontSize: 14, color: '#888' },
  infoValor: { fontSize: 14, fontWeight: '600', color: '#333' },

  btnLogout:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff1f0', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#fca5a5' },
  btnLogoutText: { color: '#e74c3c', fontWeight: '700', fontSize: 15 },
});