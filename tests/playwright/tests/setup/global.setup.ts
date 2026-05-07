import { request } from '@playwright/test';

async function globalSetup() {
  console.log('🔄 Iniciando Global Setup — limpiando y preparando la base de datos...');

  // Crea un contexto de request para hacer peticiones HTTP
  const context = await request.newContext({
    baseURL: 'http://localhost:5023',
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  });

  // ─── Paso 1: Login para obtener token ────────────────────────────────────
  const loginRes = await context.post('/auth/login', {
    data: { username: 'admin', password: 'admin123' },
  });
  const { token } = await loginRes.json();
  const headers = { Authorization: `Bearer ${token}` };

  console.log('✅ Login exitoso — token obtenido');

  // ─── Paso 2: Limpiar productos existentes ────────────────────────────────
  const productsRes = await context.get('/products', { headers });
  const products = await productsRes.json();
  for (const product of products) {
    await context.delete(`/products/${product.id}`, { headers });
  }
  console.log(`🗑️  ${products.length} productos eliminados`);

  // ─── Paso 3: Insertar productos semilla ──────────────────────────────────
  const seedProducts = [
    { name: 'Laptop', description: 'Laptop gamer', price: 15000, stock: 10 },
    { name: 'Mouse', description: 'Mouse inalambrico', price: 500, stock: 50 },
    { name: 'Teclado', description: 'Teclado mecanico', price: 1200, stock: 30 },
  ];

  for (const product of seedProducts) {
    await context.post('/products', { headers, data: product });
  }
  console.log(`🌱 ${seedProducts.length} productos semilla insertados`);

  // ─── Paso 4: Limpiar órdenes existentes ─────────────────────────────────
  const ordersRes = await context.get('/orders', { headers });
  const orders = await ordersRes.json();
  for (const order of orders) {
    await context.delete(`/orders/${order.id}`, { headers });
  }
  console.log(`🗑️  ${orders.length} órdenes eliminadas`);

  // ─── Paso 5: Insertar órdenes semilla ───────────────────────────────────
  const productsAfterSeed = await (await context.get('/products', { headers })).json();
  const seedOrders = [
    { userId: 1, productId: productsAfterSeed[0].id, quantity: 1, total: 15000, status: 'completed' },
    { userId: 2, productId: productsAfterSeed[1].id, quantity: 2, total: 1000, status: 'pending' },
  ];

  for (const order of seedOrders) {
    await context.post('/orders', { headers, data: order });
  }
  console.log(`🌱 ${seedOrders.length} órdenes semilla insertadas`);

  await context.dispose();
  console.log('✅ Global Setup completado — base de datos lista para los tests');
}

export default globalSetup;