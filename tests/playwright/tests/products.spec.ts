import { test, expect } from '@playwright/test';

let authToken: string;
let firstProductId: number;  // ID real del primer producto

test.beforeAll(async ({ request }) => {
  // Obtiene el token
  const response = await request.post('/auth/login', {
    data: { username: 'admin', password: 'admin123' },
  });
  const body = await response.json();
  authToken = body.token;

  // Obtiene los ids reales de los productos semilla
  const productsRes = await request.get('/products', {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const products = await productsRes.json();
  firstProductId = products[0].id; // ID real del primer producto
});

test.describe('Auth API', () => {

  test('POST /auth/login - debe retornar token con credenciales válidas', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: { username: 'admin', password: 'admin123' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toBeTruthy();
    expect(body.username).toBe('admin');
    expect(body.role).toBe('admin');
  });

  test('POST /auth/login - debe retornar 401 con credenciales inválidas', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: { username: 'admin', password: 'wrongpassword' },
    });
    expect(response.status()).toBe(401);
  });

  test('GET /products - debe retornar 401 sin token', async ({ request }) => {
    const response = await request.get('/products');
    expect(response.status()).toBe(401);
  });

});

test.describe('Products API', () => {

  test.describe('GET /products', () => {

    test('debe retornar status 200', async ({ request }) => {
      const response = await request.get('/products', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(200);
    });

    test('debe retornar un array', async ({ request }) => {
      const response = await request.get('/products', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
    });

    test('debe retornar al menos un producto', async ({ request }) => {
      const response = await request.get('/products', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const body = await response.json();
      expect(body.length).toBeGreaterThan(0);
    });

    test('cada producto debe tener id, name, price y stock', async ({ request }) => {
      const response = await request.get('/products', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const body = await response.json();
      for (const product of body) {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('stock');
      }
    });

  });

  test.describe('GET /products/:id', () => {

    test('debe retornar un producto existente', async ({ request }) => {
      const response = await request.get(`/products/${firstProductId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.id).toBe(firstProductId);
    });

    test('debe retornar 404 si el producto no existe', async ({ request }) => {
      const response = await request.get('/products/999999', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(404);
    });

    test('debe retornar 404 con id negativo', async ({ request }) => {
      const response = await request.get('/products/-1', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(404);
    });

  });

  test.describe('POST /products', () => {

    test('debe crear un producto y retornar 201', async ({ request }) => {
      const response = await request.post('/products', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Audífonos', description: 'Audífonos inalámbricos', price: 800, stock: 25 },
      });
      expect(response.status()).toBe(201);
    });

    test('el producto creado debe tener un id asignado', async ({ request }) => {
      const response = await request.post('/products', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Webcam', description: 'Webcam HD', price: 600, stock: 10 },
      });
      const body = await response.json();
      expect(body.id).toBeTruthy();
      expect(body.id).toBeGreaterThan(0);
    });

    test('el producto creado debe tener los datos enviados', async ({ request }) => {
      const response = await request.post('/products', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Monitor', description: 'Monitor 4K', price: 8000, stock: 15 },
      });
      const body = await response.json();
      expect(body.name).toBe('Monitor');
      expect(body.price).toBe(8000);
      expect(body.stock).toBe(15);
    });

  });

  test.describe('PUT /products/:id', () => {

    test('debe actualizar un producto existente', async ({ request }) => {
      const response = await request.put(`/products/${firstProductId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Laptop Ultra', description: 'Laptop actualizada', price: 20000, stock: 8 },
      });
      expect(response.status()).toBe(200);
    });

    test('debe retornar el producto con los datos actualizados', async ({ request }) => {
      const response = await request.put(`/products/${firstProductId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Laptop Pro Max', description: 'Laptop tope de gama', price: 25000, stock: 3 },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.name).toBe('Laptop Pro Max');
      expect(body.price).toBe(25000);
    });

    test('debe retornar 404 al actualizar un producto inexistente', async ({ request }) => {
      const response = await request.put('/products/999999', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Fantasma', description: 'No existe', price: 1, stock: 1 },
      });
      expect(response.status()).toBe(404);
    });

  });

  test.describe('DELETE /products/:id', () => {

test('debe eliminar un producto existente y retornar 204', async ({ request }) => {
  const created = await request.post('/products', {
    headers: { Authorization: `Bearer ${authToken}` },
    data: { name: 'Producto temporal', description: 'Para eliminar', price: 100, stock: 1 },
  });
  const body = await created.json();
  const response = await request.delete(`/products/${body.id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  expect(response.status()).toBe(204);
});
test('debe retornar 404 al eliminar un producto inexistente', async ({ request }) => {
      const response = await request.delete('/products/999999', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(404);
    });

  });

});