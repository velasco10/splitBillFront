import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity,
  Image, Alert, Animated, Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';
import { useAuth } from '../utils/authContext';

const SCANS_FREE_MES = 5;

export default function CamaraScreen({ navigation }) {
  const { usuario, token, login } = useAuth();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scansLocales, setScansLocales] = useState(0);
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cargarScansLocales();
    if (usuario && token) refrescarUsuario();
  }, []);

  const refrescarUsuario = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const usuarioActualizado = await res.json();
        await login(token, usuarioActualizado);
      }
    } catch (e) {
      console.error('Error refrescando usuario:', e);
    }
  };
  
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spin, {
          toValue: 1, duration: 1000,
          easing: Easing.linear, useNativeDriver: true,
        })
      ).start();
    } else {
      spin.stopAnimation(() => spin.setValue(0));
    }
  }, [loading]);

  const cargarScansLocales = async () => {
    try {
      const mes = new Date().toISOString().slice(0, 7);
      const raw = await AsyncStorage.getItem('scans_local');
      const data = raw ? JSON.parse(raw) : {};
      if (data.mes !== mes) {
        await AsyncStorage.setItem('scans_local', JSON.stringify({ mes, count: 0 }));
        setScansLocales(0);
      } else {
        setScansLocales(data.count || 0);
      }
    } catch (e) {
      console.error('Error cargando scans locales:', e);
    }
  };

  const incrementarScanLocal = async () => {
    try {
      const mes = new Date().toISOString().slice(0, 7);
      const raw = await AsyncStorage.getItem('scans_local');
      const data = raw ? JSON.parse(raw) : { mes, count: 0 };
      const nuevaData = { mes, count: (data.mes === mes ? data.count : 0) + 1 };
      await AsyncStorage.setItem('scans_local', JSON.stringify(nuevaData));
      setScansLocales(nuevaData.count);
    } catch (e) {
      console.error('Error incrementando scans locales:', e);
    }
  };

  const calcularRestantes = () => {
    if (usuario?.plan === 'premium') return null; // null = ilimitado
    if (usuario) return Math.max(0, SCANS_FREE_MES - (usuario.scans_mes || 0));
    return Math.max(0, SCANS_FREE_MES - scansLocales);
  };

  const restantes = calcularRestantes();
  const sinScans = restantes === 0;
  const esPremium = usuario?.plan === 'premium';

  const handleImage = async (uri) => {
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 900 } }],
        { base64: true, compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImage(manipulated.uri);
      await uploadImage(manipulated.base64, 'image/jpeg');
    } catch (e) {
      Alert.alert('Error', 'No se pudo preparar la imagen');
    }
  };

  const request = async (fn, kind) => {
    const { status } = kind === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Activa permisos para continuar.');
      return null;
    }
    const result = await fn({ quality: 1 });
    if (!result?.canceled) return result.assets[0].uri;
    return null;
  };

  const pickImageFromCamera = async () => {
    if (sinScans) return;
    const uri = await request(ImagePicker.launchCameraAsync, 'camera');
    if (uri) await handleImage(uri);
  };

  const pickImageFromGallery = async () => {
    if (sinScans) return;
    const uri = await request(ImagePicker.launchImageLibraryAsync, 'gallery');
    if (uri) await handleImage(uri);
  };

  const uploadImage = async (base64, type) => {
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/procesar_ticket/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ base64, mimetype: type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error en el servidor');
      }

      // Actualizar contador
      if (usuario && token) {
        try {
          const resUser = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resUser.ok) {
            const usuarioActualizado = await resUser.json();
            await login(token, usuarioActualizado);
          }
        } catch (e) {
          console.error('Error refrescando usuario:', e);
        }
      } else {
        await incrementarScanLocal();
      }

      navigation.navigate('AgregarPersonas', { lineas: data.lineas });

    } catch (error) {
      console.error('DEBUG UPLOAD:', error.message);
      Alert.alert('Error al procesar', error.message);
      setImage(null);
    } finally {
      setLoading(false);
    }
  };

  const spinStyle = {
    transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <AppBackground>

          {/* Contador scans */}
          {!esPremium && (
            <View style={[styles.scansCard, sinScans && styles.scansCardAgotado]}>
              <View style={styles.scansLeft}>
                <Ionicons
                  name={sinScans ? 'close-circle' : 'camera'}
                  size={22}
                  color={sinScans ? '#e74c3c' : '#2563eb'}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={[styles.scansNumero, sinScans && { color: '#e74c3c' }]}>
                    {sinScans ? 'Sin scans disponibles' : `${restantes} scan${restantes !== 1 ? 's' : ''} restante${restantes !== 1 ? 's' : ''}`}
                  </Text>
                  <Text style={styles.scansSub}>
                    {sinScans
                      ? 'Se renuevan el próximo mes'
                      : `${SCANS_FREE_MES - restantes} de ${SCANS_FREE_MES} usados este mes`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.btnPremiumSmall}
                onPress={() => navigation.navigate(usuario ? 'Perfil' : 'Login')}
              >
                <Text style={styles.btnPremiumSmallText}>
                  {usuario ? 'Premium' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Banner sin scans */}
          {sinScans && (
            <View style={styles.bannerAgotado}>
              <Ionicons name="information-circle-outline" size={20} color="#e74c3c" style={{ marginRight: 8 }} />
              <Text style={styles.bannerAgotadoText}>
                Has usado tus {SCANS_FREE_MES} scans gratuitos este mes.
                {usuario
                  ? ' Hazte Premium para scans ilimitados.'
                  : ' Inicia sesión o hazte Premium para continuar.'}
              </Text>
            </View>
          )}

          {/* Aviso / Hero — solo si hay scans */}
          {!sinScans && (
            <View style={styles.banner}>
              <Ionicons name="receipt-outline" size={22} color="#2563eb" style={{ marginRight: 8 }} />
              <Text style={styles.bannerText}>
                Saca una foto del ticket para obtener el desglose de productos y dividir por consumidor automáticamente.
              </Text>
            </View>
          )}

          {/* Botones */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={pickImageFromCamera}
              activeOpacity={sinScans ? 1 : 0.9}
              style={styles.btnOuter}
              disabled={sinScans}
            >
              <LinearGradient
                colors={sinScans ? ['#ccc', '#bbb'] : ['#3b82f6', '#2563eb']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.btn}
              >
                <Ionicons name="camera-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>
                  {sinScans ? 'Sin scans disponibles' : 'Tomar foto del ticket'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImageFromGallery}
              activeOpacity={sinScans ? 1 : 0.9}
              style={styles.btnOuter}
              disabled={sinScans}
            >
              <View style={[
                styles.btn,
                {
                  backgroundColor: sinScans ? '#f0f0f0' : '#eef2ff',
                  borderWidth: 1,
                  borderColor: sinScans ? '#ddd' : '#c7d2fe'
                }
              ]}>
                <Ionicons
                  name="image-outline" size={20}
                  color={sinScans ? '#bbb' : '#2563eb'}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.btnText, { color: sinScans ? '#bbb' : '#2563eb' }]}>
                  {sinScans ? 'Sin scans disponibles' : 'Seleccionar desde galería'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Botón upgrade si sin scans */}
            {sinScans && (
              <TouchableOpacity
                style={styles.btnUpgrade}
                onPress={() => navigation.navigate(usuario ? 'Perfil' : 'Login')}
              >
                <Ionicons name="star-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.btnUpgradeText}>
                  {usuario ? 'Hazte Premium — scans ilimitados' : 'Iniciar sesión / Hazte Premium'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Preview */}
          {image && (
            <View style={styles.previewWrap}>
              <Image source={{ uri: image }} style={styles.preview} />
            </View>
          )}

          {/* Loader overlay */}
          {loading && (
            <View style={styles.loaderOverlay} pointerEvents="auto">
              <View style={styles.loaderCard}>
                <Animated.View style={[styles.spinner, spinStyle]} />
                <Text style={styles.loaderText}>Procesando ticket…</Text>
              </View>
            </View>
          )}

        </AppBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },

  scansCard: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff', borderRadius: 12,
    padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  scansCardAgotado: { backgroundColor: '#fff1f0', borderColor: '#fca5a5' },
  scansLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  scansNumero: { fontSize: 14, fontWeight: '700', color: '#2563eb' },
  scansSub: { fontSize: 11, color: '#888', marginTop: 2 },

  btnPremiumSmall: {
    backgroundColor: '#2563eb', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8,
  },
  btnPremiumSmallText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  bannerAgotado: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff1f0', borderRadius: 12,
    padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#fca5a5',
  },
  bannerAgotadoText: { flex: 1, fontSize: 13, color: '#e74c3c', lineHeight: 18 },

  banner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#eff6ff', borderColor: '#bfdbfe',
    borderWidth: 1, padding: 12, borderRadius: 12,
  },
  bannerText: { flex: 1, color: '#1f2937' },

  actions: { marginTop: 20 },
  btnOuter: { marginBottom: 12 },
  btn: {
    height: 48, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 16,
  },
  btnText: { color: '#fff', fontWeight: '600' },

  btnUpgrade: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f59e0b', borderRadius: 12,
    padding: 14, marginTop: 4,
  },
  btnUpgradeText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  previewWrap: { marginTop: 16, alignItems: 'center' },
  preview: { width: 260, height: 260, borderRadius: 12, resizeMode: 'cover' },

  loaderOverlay: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  loaderCard: {
    width: 220, padding: 20, borderRadius: 16,
    backgroundColor: '#fff', alignItems: 'center',
  },
  spinner: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 4, borderColor: '#e5e7eb',
    borderTopColor: '#2563eb', marginBottom: 12,
  },
  loaderText: { fontWeight: '600', color: '#111827' },
});