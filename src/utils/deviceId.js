import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export const getDeviceId = async () => {
    let id = await AsyncStorage.getItem('device_id');
    console.log("Leído desde AsyncStorage:", id);
    if (!id) {
        id = uuidv4();
        await AsyncStorage.setItem('device_id', id);
    }
    return id;
};
