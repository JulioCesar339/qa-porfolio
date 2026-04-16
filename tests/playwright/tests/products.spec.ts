import { test, expect } from '@playwright/test';

test.describe('Products API', () => {

  test.describe('GET /products', () => {

    test('debe retornar status 200', async ({ request }) => {
      const response = await request.get('/products');
      expect(response.status()).toBe(200);
    });

    test('debe retornar un array', async ({ request }) => {
      const response = await request.get('/products');
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
    });

    test('debe retornar al menos un producto', async ({ request }) => {
      const response = await request.get('/products');
      const body = await response.json();
      expect(body.length).toBeGreaterThan(0);
    });

    test('cada producto debe tener id, name, price y stock', async ({ request }) => {
      const response = await request.get('/products');
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
      const response = await request.get('/products/1');
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.id).toBe(1);
    });

    test('debe retornar 404 si el producto no existe', async ({ request }) => {
      const response = await request.get('/products/999');
      expect(response.status()).toBe(404);
    });

    test('debe retornar 404 con id negativo', async ({ request }) => {
      const response = await request.get('/products/-1');
      expect(response.status()).toBe(404);
    });

  });

  test.describe('POST /products', () => {

    test('debe crear un producto y retornar 201', async ({ request }) => {
      const response = await request.post('/products', {
        data: {
          name: 'Audífonos',
          description: 'Audífonos inalámbricos',
          price: 800,
          stock: 25,
        },
      });
      expect(response.status()).toBe(201);
    });

    test('el producto creado debe tener un id asignado', async ({ request }) => {
      const response = await request.post('/products', {
        data: {
          name: 'Webcam',
          description: 'Webcam HD',
          price: 600,
          stock: 10,
        },
      });
      const body = await response.json();
      expect(body.id).toBeTruthy();
      expect(body.id).toBeGreaterThan(0);
    });

    test('el producto creado debe tener los datos enviados', async ({ request }) => {
      const response = await request.post('/products', {
        data: {
          name: 'Monitor',
          description: 'Monitor 4K',
          price: 8000,
          stock: 15,
        },
      });
      const body = await response.json();
      expect(body.name).toBe('Monitor');
      expect(body.price).toBe(8000);
      expect(body.stock).toBe(15);
    });

  });

  test.describe('PUT /products/:id', () => {

    test('debe actualizar un producto existente', async ({ request }) => {
      const response = await request.put('/products/1', {
        data: {
          name: 'Laptop Ultra',
          description: 'Laptop actualizada',
          price: 20000,
          stock: 8,
        },
      });
      expect(response.status()).toBe(200);
    });

    test('debe retornar el producto con los datos actualizados', async ({ request }) => {
      const response = await request.put('/products/1', {
        data: {
          name: 'Laptop Pro Max',
          description: 'Laptop tope de gama',
          price: 25000,
          stock: 3,
        },
      });
      const body = await response.json();
      expect(body.name).toBe('Laptop Pro Max');
      expect(body.price).toBe(25000);
    });

    test('debe retornar 404 al actualizar un producto inexistente', async ({ request }) => {
      const response = await request.put('/products/999', {
        data: {
          name: 'Fantasma',
          description: 'No existe',
          price: 1,
          stock: 1,
        },
      });
      expect(response.status()).toBe(404);
    });

  });

  test.describe('DELETE /products/:id', () => {

    test('debe eliminar un producto existente y retornar 204', async ({ request }) => {
      const response = await request.delete('/products/3');
      expect(response.status()).toBe(204);
    });

    test('debe retornar 404 al eliminar un producto inexistente', async ({ request }) => {
      const response = await request.delete('/products/999');
      expect(response.status()).toBe(404);
    });

  });

});