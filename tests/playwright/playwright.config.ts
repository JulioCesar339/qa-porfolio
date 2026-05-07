import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 1,                          // Reintenta 1 vez si falla — genera más info de debug
  globalSetup: './tests/setup/global.setup.ts', // ← Ejecuta este archivo antes de todos los tests
  reporter: [
    ['html', { open: 'never' }],       // Reporte HTML local
    ['list'],                           // Muestra resultados en consola
    ['junit', { outputFile: 'results/junit-results.xml' }], // Para CI/CD
  ],
  use: {
    baseURL: 'http://localhost:5023',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
    screenshot: 'only-on-failure',     // Screenshot solo cuando falla un test
    video: 'retain-on-failure',        // Video solo cuando falla un test
    trace: 'on-first-retry',           // Trace cuando reintenta un test
  },
  projects: [
    {
      name: 'api-tests',
      testMatch: '**/*.spec.ts',
    },
  ],
});