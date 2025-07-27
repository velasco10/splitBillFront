import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

export const getDeviceId = async () => {
  try {
    let id = await AsyncStorage.getItem('deviceId');
    if (!id) {
      id = uuid.v4(); 
      await AsyncStorage.setItem('deviceId', id);
    }
    console.log("deviceID", id)
    return id;
  } catch (error) {
    console.error('Error al obtener deviceId:', error);
    return 'unknown-device';
  }
};
