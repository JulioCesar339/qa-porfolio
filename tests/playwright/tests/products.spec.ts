import { test, expect } from '@playwright/test';

test.describe('Products API', () => {

  test('GET /products - debe retornar lista de productos', async ({ request }) => {
    const response = await request.get('/products');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test('GET /products/1 - debe retornar un producto', async ({ request }) => {
    const response = await request.get('/products/1');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(1);
    expect(body.name).toBeTruthy();
    expect(body.price).toBeGreaterThan(0);
  });

  test('GET /products/999 - debe retornar 404 si no existe', async ({ request }) => {
    const response = await request.get('/products/999');

    expect(response.status()).toBe(404);
  });

  test('POST /products - debe crear un producto nuevo', async ({ request }) => {
    const response = await request.post('/products', {
      data: {
        name: 'Audífonos',
        description: 'Audífonos inalámbricos',
        price: 800,
        stock: 25,
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.id).toBeTruthy();
    expect(body.name).toBe('Audífonos');
  });

  test('PUT /products/1 - debe actualizar un producto', async ({ request }) => {
    const response = await request.put('/products/1', {
      data: {
        name: 'Laptop Ultra',
        description: 'Laptop actualizada',
        price: 20000,
        stock: 8,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe('Laptop Ultra');
    expect(body.price).toBe(20000);
  });

  test('DELETE /products/3 - debe eliminar un producto', async ({ request }) => {
    const response = await request.delete('/products/3');

    expect(response.status()).toBe(204);
  });

});