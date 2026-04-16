# QA Automation Portfolio

[![QA Automation Tests](https://github.com/JulioCesar339/qa-porfolio/actions/workflows/playwright.yml/badge.svg)](https://github.com/JulioCesar339/qa-porfolio/actions/workflows/playwright.yml)

API REST construida con .NET 9 y suite de pruebas automatizadas con Playwright + TypeScript.

## Tecnologías

- .NET 9 — API REST
- Playwright + TypeScript — Tests automatizados
- Docker — Contenedorización
- GitHub Actions — CI/CD

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /products | Lista todos los productos |
| GET | /products/{id} | Obtiene un producto |
| POST | /products | Crea un producto |
| PUT | /products/{id} | Actualiza un producto |
| DELETE | /products/{id} | Elimina un producto |

## Correr el proyecto

### Requisitos
- Git
- Docker
- Node.js 18+

### 1. Clonar el repositorio
```bash
git clone https://github.com/JulioCesar339/qa-porfolio.git
cd qa-porfolio
```

### 2. Levantar la API con Docker
```bash
docker compose up
```

API disponible en: `http://localhost:5023`  
Documentación: `http://localhost:5023/scalar/v1`

### 3. Correr los tests
```bash
cd tests/playwright
npm install
npx playwright install chromium
npx playwright test
```

### 4. Ver el reporte
```bash
npx playwright show-report
```