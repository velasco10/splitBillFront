import AsyncStorage from '@react-native-async-storage/async-storage';

export const guardarGrupoUnido = async (grupoId) => {
  const json = await AsyncStorage.getItem('grupos_unidos');
  const actuales = json ? JSON.parse(json) : [];
  if (!actuales.includes(grupoId)) {
    actuales.push(grupoId);
    await AsyncStorage.setItem('grupos_unidos', JSON.stringify(actuales));
  }
};

export const obtenerGruposUnidos = async () => {
  const json = await AsyncStorage.getItem('grupos_unidos');
  return json ? JSON.parse(json) : [];
};
