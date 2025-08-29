import React, { useState } from 'react';
import { View, Button, ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { API_URL } from '../config';

export default function CamaraScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImage = async (uri) => {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 600 } }],
      { base64: true, compress: 0.5 }
    );
    setImage(manipulated.uri);
    uploadImage(manipulated.base64, "image/jpeg");
  };

  const pickImageFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permiso denegado');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) {
      await handleImage(result.assets[0].uri);
    }
  };

  const pickImageFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permiso denegado');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (!result.canceled) {
      await handleImage(result.assets[0].uri);
    }
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
      navigation.navigate('AgregarPersonas', { lineas: data.lineas });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'No se pudo procesar la imagen');
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Abrir cámara" onPress={pickImageFromCamera} />
      <Button title="Seleccionar desde galería" onPress={pickImageFromGallery} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginTop: 20 }} />}
      {loading && <ActivityIndicator size="large" />}
    </View>
  );
}
