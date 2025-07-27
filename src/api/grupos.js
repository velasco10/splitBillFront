import { API_URL } from '../config';

import { getDeviceId } from '../utils/deviceId';
import { obtenerGruposUnidos } from '../utils/localGroups';

export const obtenerMisGrupos = async () => {
  const creadorId = await getDeviceId();
  const unidos = await obtenerGruposUnidos();

  // Llamada al backend para grupos creados
  const resCreados = await fetch(`${API_URL}/grupos/creador/${creadorId}`);
  const creados = await resCreados.json();

  // Llamada a varios grupos por ID
  const resUnidos = await fetch(`${API_URL}/grupos/varios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: unidos }),
  });
  const unidosData = await resUnidos.json();

  return [...creados, ...unidosData];
};
