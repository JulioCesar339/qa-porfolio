import http from 'k6/http';
import { check, sleep } from 'k6';

// ─── Configuración del test de carga ─────────────────────────────────────────
export const options = {
  stages: [
    { duration: '10s', target: 10 },  // Sube gradualmente a 10 usuarios en 10 segundos
    { duration: '20s', target: 10 },  // Mantiene 10 usuarios por 20 segundos
    { duration: '10s', target: 0 },   // Baja gradualmente a 0 usuarios en 10 segundos
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // El 95% de las peticiones deben responder en menos de 500ms
    http_req_failed: ['rate<0.01'],   // Menos del 1% de las peticiones deben fallar
  },
};

const BASE_URL = 'http://localhost:5023';

// ─── Setup: se ejecuta una vez antes del test ─────────────────────────────────
export function setup() {
  // Hace login y obtiene el token para usarlo en los tests
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ username: 'admin', password: 'admin123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, {
    'login exitoso': (r) => r.status === 200,  // Verifica que el login fue exitoso
  });

  return { token: loginRes.json('token') };     // Devuelve el token para usarlo en los tests
}

// ─── Test principal: se ejecuta por cada usuario virtual ─────────────────────
export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,  // Usa el token obtenido en setup
  };

  // GET /products — obtiene la lista de productos
  const productsRes = http.get(`${BASE_URL}/products`, { headers });
  check(productsRes, {
    'GET /products status 200': (r) => r.status === 200,       // Verifica status
    'GET /products tiene productos': (r) => r.json().length > 0, // Verifica que hay datos
  });

  sleep(0.5); // Espera 0.5 segundos entre peticiones (simula comportamiento humano)

  // GET /products/1 — obtiene un producto específico
  const productRes = http.get(`${BASE_URL}/products/1`, { headers });
  check(productRes, {
    'GET /products/1 status 200': (r) => r.status === 200,
  });

  sleep(0.5);

  // GET /orders — obtiene la lista de órdenes
  const ordersRes = http.get(`${BASE_URL}/orders`, { headers });
  check(ordersRes, {
    'GET /orders status 200': (r) => r.status === 200,
  });

  sleep(1); // Espera 1 segundo antes de la siguiente iteración
}