# QA Automation Portfolio

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

```bash
cd src/Api
dotnet run
```

API disponible en: `http://localhost:5023`
Documentación: `http://localhost:5023/scalar/v1`