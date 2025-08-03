import AsyncStorage from '@react-native-async-storage/async-storage';

export const guardarGrupoUnido = async (id) => {
  const actual = await obtenerGruposUnidos();
  if (!actual.includes(id)) {
    await AsyncStorage.setItem('gruposUnidos', JSON.stringify([...actual, id]));
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
