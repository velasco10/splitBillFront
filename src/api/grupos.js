import { API_URL } from '../../config';

export async function obtenerGrupos() {
  const res = await fetch(`${API_URL}/grupos`);
  if (!res.ok) throw new Error('Error obteniendo grupos');
  return await res.json();
}
