import React, { useState } from 'react';
import { View, Button, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function CamaraScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
      uploadImage(result.uri);
    }
  };

const uploadImage = async (uri) => {
  setLoading(true);
  let formData = new FormData();
  formData.append('file', {
    uri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  });

  try {
    const response = await fetch('http://127.0.0.1:8000/procesar_ticket/', {
      method: 'POST',
      body: formData,
      headers: {
        // No pongas Content-Type, React Native la genera bien sola para FormData
      }
    });

    const data = await response.json();
    setLoading(false);
    navigation.navigate('AsignarProductosScreen', data);
  } catch (error) {
    setLoading(false);
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
