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

test.describe('Users API', () => {

  test.describe('GET /users', () => {

    test('debe retornar status 200', async ({ request }) => {
      const response = await request.get('/users', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(200);
    });

    test('debe retornar un array', async ({ request }) => {
      const response = await request.get('/users', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
    });

    test('cada usuario debe tener id, username y role', async ({ request }) => {
      const response = await request.get('/users', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const body = await response.json();
      for (const user of body) {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('role');
      }
    });

  });

  test.describe('GET /users/:id', () => {

    test('debe retornar un usuario existente', async ({ request }) => {
      const response = await request.get('/users/1', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.id).toBe(1);
      expect(body.username).toBe('admin');
    });

    test('debe retornar 404 si el usuario no existe', async ({ request }) => {
      const response = await request.get('/users/999', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(404);
    });

  });

  test.describe('POST /users', () => {

    test('debe crear un usuario y retornar 201', async ({ request }) => {
      const response = await request.post('/users', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { username: 'testuser', password: 'test123', role: 'user' },
      });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.username).toBe('testuser');
      expect(body.id).toBeTruthy();
    });

  });

  test.describe('PUT /users/:id', () => {

    test('debe actualizar un usuario existente', async ({ request }) => {
      const response = await request.put('/users/2', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { username: 'userupdated', password: 'newpass123', role: 'user' },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.username).toBe('userupdated');
    });

    test('debe retornar 404 al actualizar usuario inexistente', async ({ request }) => {
      const response = await request.put('/users/999', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { username: 'fantasma', password: '123', role: 'user' },
      });
      expect(response.status()).toBe(404);
    });

  });

  test.describe('DELETE /users/:id', () => {

    test('debe eliminar un usuario existente y retornar 204', async ({ request }) => {
      // Primero crea un usuario para eliminarlo
      const created = await request.post('/users', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { username: 'temporal', password: 'temp123', role: 'user' },
      });
      const body = await created.json();

      // Luego lo elimina
      const response = await request.delete(`/users/${body.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(204);
    });

    test('debe retornar 404 al eliminar usuario inexistente', async ({ request }) => {
      const response = await request.delete('/users/999', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.status()).toBe(404);
    });

  });

});