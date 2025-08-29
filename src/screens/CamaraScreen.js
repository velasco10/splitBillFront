import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image, Alert, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { API_URL } from '../config';
import AppBackground from '../components/AppBackground';

export default function CamaraScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spin.stopAnimation(() => spin.setValue(0));
    }
  }, [loading]);

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
    const uri = await request(ImagePicker.launchCameraAsync, 'camera');
    if (uri) await handleImage(uri);
  };

  const pickImageFromGallery = async () => {
    const uri = await request(ImagePicker.launchImageLibraryAsync, 'gallery');
    if (uri) await handleImage(uri);
  };

  const uploadImage = async (base64, type) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/procesar_ticket/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, mimetype: type }),
      });
      const data = await response.json();
      setLoading(false);
      if (!data?.lineas) throw new Error('Respuesta inválida');
      navigation.navigate('AgregarPersonas', { lineas: data.lineas });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'No se pudo procesar la imagen');
    }
  };

  const spinStyle = {
    transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
                      <AppBackground>
        {/* Aviso / Hero */}
        <View style={styles.banner}>
          <Ionicons name="receipt-outline" size={22} color="#2563eb" style={{ marginRight: 8 }} />
          <Text style={styles.bannerText}>
            Saca una foto del ticket para obtener el desglose de productos y dividir por consumidor automáticamente.
          </Text>
        </View>

        {/* Botones principales */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={pickImageFromCamera} activeOpacity={0.9} style={styles.btnOuter}>
            <LinearGradient colors={["#3b82f6", "#2563eb"]} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.btn}>
              <Ionicons name="camera-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnText}>Tomar foto del ticket</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImageFromGallery} activeOpacity={0.9} style={styles.btnOuter}>
            <View style={[styles.btn, { backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#c7d2fe' }] }>
              <Ionicons name="image-outline" size={20} color="#2563eb" style={{ marginRight: 8 }} />
              <Text style={[styles.btnText, { color: '#2563eb' }]}>Seleccionar desde galería</Text>
            </View>
          </TouchableOpacity>
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

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
  },
  bannerText: { flex: 1, color: '#1f2937' },

  actions: { marginTop: 20 },
  btnOuter: { marginBottom: 12 },
  btn: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnText: { color: '#fff', fontWeight: '600' },

  previewWrap: { marginTop: 16, alignItems: 'center' },
  preview: { width: 260, height: 260, borderRadius: 12, resizeMode: 'cover' },

  loaderOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderCard: {
    width: 220,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  spinner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 4,
    borderColor: '#e5e7eb',
    borderTopColor: '#2563eb',
    marginBottom: 12,
  },
  loaderText: { fontWeight: '600', color: '#111827' },
});
