import React, { useState } from 'react';
import { View, Button, ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { API_URL } from '../config';

export default function CamaraScreen({ navigation }) {

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lanzar cámara y obtener base64
  const pickImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    console.log("pickImage")
    if (permission.status !== 'granted') {
      Alert.alert('Permiso denegado');
      return;
    }
    console.log("result")

    let result = await ImagePicker.launchCameraAsync({
      base64: false,
      quality: 1,
    });
    console.log("resize")
    if (!result.canceled) {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 600 } }], // Ajusta el tamaño
        { base64: true, compress: 0.5 }
      );

      setImage(manipulated.uri);
      uploadImage(manipulated.base64, "image/jpeg");
    }
  };


  // Subir base64 al backend
  const uploadImage = async (base64, type) => {
    setLoading(true);
    try {
      console.log('uploadImage', API_URL);
      const response = await fetch(`${API_URL}/procesar_ticket/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: base64,
          mimetype: type
        }),
      });
      const data = await response.json();
      setLoading(false);
      navigation.navigate('AgregarPersonas', { lineas: data.lineas });
    } catch (error) {
      setLoading(false);
      console.log(error)
      Alert.alert('Error', 'No se pudo procesar la imagen');
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Abrir cámara" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginTop: 20 }} />}
      {loading && <ActivityIndicator size="large" />}
    </View>
  );
}
