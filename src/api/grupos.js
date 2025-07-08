const API_URL = 'http://localhost:8000/grupos';

export async function obtenerGrupos() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error obteniendo grupos');
  return await res.json();
}
