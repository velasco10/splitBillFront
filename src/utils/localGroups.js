import AsyncStorage from '@react-native-async-storage/async-storage';

export const guardarGrupoUnido = async (id) => {
  if (!id || typeof id !== 'string') return; // ignora falsos/raros
  const actual = await obtenerGruposUnidos();
  const limpio = Array.isArray(actual) ? actual.filter(Boolean) : [];
  if (!limpio.includes(id)) {
    await AsyncStorage.setItem('gruposUnidos', JSON.stringify([...limpio, id]));
  }
};

export const obtenerGruposUnidos = async () => {
  const data = await AsyncStorage.getItem('gruposUnidos');
  return data ? JSON.parse(data) : [];
};

export const salirDeGrupo = async (id) => {
  const actual = await obtenerGruposUnidos();
  const filtrado = actual.filter((gid) => gid !== id);
  await AsyncStorage.setItem('gruposUnidos', JSON.stringify(filtrado));
};

export const limpiarGruposInvalidos = async () => {
  const actual = await obtenerGruposUnidos();
  const esObjId = (s) => typeof s === 'string' && /^[a-f0-9]{24}$/i.test(s);
  const limpio = (Array.isArray(actual) ? actual : []).filter(esObjId);
  await AsyncStorage.setItem('gruposUnidos', JSON.stringify(limpio));
  return limpio;
};
