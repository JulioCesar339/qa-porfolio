import { test, expect } from '@playwright/test';

// Token compartido para todos los tests
let authToken: string;

// Obtiene el token antes de todos los tests
test.beforeAll(async ({ request }) => {
  const response = await request.post('/auth/login', {
    data: { username: 'admin', password: 'admin123' },
  });
  const body = await response.json();
  authToken = body.token;
});

test.describe('Orders API', () => {

  test.describe('GET /orders', () => {

    test('debe retornar status 200', async ({ request }) => {
      const response = await request.get('/orders', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(200);
    });

    test('debe retornar un array', async ({ request }) => {
      const response = await request.get('/orders', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
    });

    test('cada orden debe tener id, userId, productId, total y status', async ({ request }) => {
      const response = await request.get('/orders', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const body = await response.json();
      for (const order of body) {
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('userId');
        expect(order).toHaveProperty('productId');
        expect(order).toHaveProperty('total');
        expect(order).toHaveProperty('status');
      }
    });

  });

  test.describe('GET /orders/:id', () => {

    test('debe retornar una orden existente', async ({ request }) => {
      const response = await request.get('/orders/1', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.id).toBe(1);
      expect(body.status).toBe('completed');
    });

    test('debe retornar 404 si la orden no existe', async ({ request }) => {
      const response = await request.get('/orders/999', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(404);
    });

  });

  test.describe('POST /orders', () => {

    test('debe crear una orden y retornar 201', async ({ request }) => {
      const response = await request.post('/orders', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { userId: 1, productId: 2, quantity: 3, total: 1500, status: 'pending' },
      });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.id).toBeTruthy();
      expect(body.status).toBe('pending');
    });

    test('la orden creada debe tener los datos enviados', async ({ request }) => {
      const response = await request.post('/orders', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { userId: 2, productId: 1, quantity: 1, total: 15000, status: 'pending' },
      });
      const body = await response.json();
      expect(body.userId).toBe(2);
      expect(body.productId).toBe(1);
      expect(body.total).toBe(15000);
    });

  });

  test.describe('PUT /orders/:id', () => {

    test('debe actualizar el status de una orden', async ({ request }) => {
      const response = await request.put('/orders/2', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { userId: 2, productId: 2, quantity: 2, total: 1000, status: 'completed' },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.status).toBe('completed');
    });

    test('debe retornar 404 al actualizar orden inexistente', async ({ request }) => {
      const response = await request.put('/orders/999', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { userId: 1, productId: 1, quantity: 1, total: 100, status: 'cancelled' },
      });
      expect(response.status()).toBe(404);
    });

  });

  test.describe('DELETE /orders/:id', () => {

    test('debe eliminar una orden existente y retornar 204', async ({ request }) => {
      // Primero crea una orden para eliminarla
      const created = await request.post('/orders', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { userId: 1, productId: 1, quantity: 1, total: 100, status: 'pending' },
      });
      const body = await created.json();

      // Luego la elimina
      const response = await request.delete(`/orders/${body.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(204);
    });

    test('debe retornar 404 al eliminar orden inexistente', async ({ request }) => {
      const response = await request.delete('/orders/999', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(404);
    });

  });

});