import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Sube rápido a 100
    { duration: '1m', target: 100 }, // Sube a 200 (Zona de peligro)
    { duration: '30s', target: 30 }, // Sube a 300 (Punto de quiebre)
    { duration: '20s', target: 0 },   // Bajada rápida
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:5023';

export default function () {
  const headers = { 'Content-Type': 'application/json' };

  // 1. Ahora el LOGIN estresa la API en cada iteración
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ username: 'admin', password: 'admin123' }),
    { headers, tags: { name: 'auth_login' } }
  );

  const loginPassed = check(loginRes, {
    'login exitoso': (r) => r.status === 200,
  });

  // Si el login falla, no tiene caso continuar esta iteración
  if (!loginPassed) {
    sleep(1);
    return;
  }

  // Extraemos el token generado dinámicamente
  const token = loginRes.json('token');
  const authHeaders = {
    ...headers,
    Authorization: `Bearer ${token}`,
  };

  // 2. Flujo de endpoints con etiquetas para medir cuál se rompe primero
  const productsRes = http.get(`${BASE_URL}/products`, { headers: authHeaders, tags: { name: 'get_products' } });
  check(productsRes, {
    'GET /products status 200': (r) => r.status === 200,
  });

  sleep(0.3); // Tiempos de espera ligeramente más cortos para presionar más

  const productRes = http.get(`${BASE_URL}/products/1`, { headers: authHeaders, tags: { name: 'get_product_id' } });
  check(productRes, { 'GET /products/1 status 200': (r) => r.status === 200 });

  sleep(0.3);

  const ordersRes = http.get(`${BASE_URL}/orders`, { headers: authHeaders, tags: { name: 'get_orders' } });
  check(ordersRes, { 'GET /orders status 200': (r) => r.status === 200 });

  sleep(0.5);
}
