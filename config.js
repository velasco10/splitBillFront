let API_URL;

try {
  const env = require('@env');
  console.log(`Llamada api en ${env}`)
  API_URL = env.API_URL || 'http://localhost:8000';
} catch (e) {
  API_URL = 'http://localhost:8000';
}

export { API_URL };
