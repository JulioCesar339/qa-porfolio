// tests/setup/global.setup.ts
import { Client } from 'pg'; 
import * as dotenv from 'dotenv'; // Importamos dotenv para leer tus credenciales del .env
import path from 'path';

// Subimos 3 niveles: setup -> tests -> playwright -> qa-portfolio (.env)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Global Setup: Prepara la base de datos antes de disparar los 39 tests.
 */
async function globalSetup() {
  // Configuramos la conexión usando los valores de tu docker-compose y .env
  const client = new Client({
    // Usamos 'localhost' porque Playwright corre desde tu máquina hacia el contenedor
    host: 'localhost',
    // Usamos el puerto 5433 que es el que definiste en tu docker-compose (5433:5432)
    port: 5433, 
    // Tomamos las credenciales directamente de tu archivo .env
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB
  });

  try {
    // Intentamos establecer comunicación con el contenedor qa-portfolio-db
    await client.connect(); 
    console.log('--- 🛡️  Iniciando limpieza de entorno de pruebas ---');

    /**
     * TRUNCATE: Limpia las tablas.
     * RESTART IDENTITY: Clave para que tus tests que esperan ID: 1 funcionen siempre.
     * CASCADE: Borra en cascada para evitar errores de llaves foráneas entre productos y órdenes.
     */
    await client.query('TRUNCATE TABLE "Users", "Products", "Orders" RESTART IDENTITY CASCADE');
    console.log('✅ Base de datos reseteada (Tablas vacías e IDs en 1).');

    /**
     * SEEDING: Inyectamos el usuario admin.
     * Importante: Si tu API de .NET usa Entity Framework, los nombres de tablas 
     * suelen ir en mayúsculas o plural, asegúrate de que coincidan (ej. "Users").
     */
    await client.query(`
      INSERT INTO "Users" ("Username", "Password", "Role") 
      VALUES ('admin', 'admin123', 'admin')
    `);
    console.log('✅ Usuario administrador inyectado para autenticación.');

    // Insertamos un producto semilla para que los tests de GET /products encuentren datos
    await client.query(`
      INSERT INTO "Products" ("Name", "Price", "Stock") 
      VALUES ('Producto Inicial Portafolio', 10.50, 100)
    `);
    console.log('✅ Datos semilla de productos creados.');

  } catch (error) {
    // Si la DB no está arriba o el login falla, el proceso se detiene con error
    console.error('❌ Error crítico preparando la base de datos:', error);
    process.exit(1); 
  } finally {
    // Cerramos la conexión para no saturar el pool de PostgreSQL
    await client.end();
    console.log('--- 🚀 Ambiente de pruebas listo para Playwright ---');
  }
}

export default globalSetup;
