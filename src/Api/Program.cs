using Api.Models;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// Datos en memoria (por ahora sin base de datos)
var products = new List<Product>
{
    new Product { Id = 1, Name = "Laptop", Description = "Laptop gamer", Price = 15000, Stock = 10 },
    new Product { Id = 2, Name = "Mouse", Description = "Mouse inalambrico", Price = 500, Stock = 50 },
    new Product { Id = 3, Name = "Teclado", Description = "Teclado mecanico", Price = 1200, Stock = 30 }
};

// GET /products - Lista todos
app.MapGet("/products", () =>
{
    return Results.Ok(products);
});

// GET /products/{id} - Obtiene uno
app.MapGet("/products/{id}", (int id) =>
{
    var product = products.FirstOrDefault(p => p.Id == id);
    return product is not null ? Results.Ok(product) : Results.NotFound();
});

// POST /products - Crea uno nuevo
app.MapPost("/products", (Product product) =>
{
    product.Id = products.Max(p => p.Id) + 1;
    products.Add(product);
    return Results.Created($"/products/{product.Id}", product);
});

// PUT /products/{id} - Actualiza uno
app.MapPut("/products/{id}", (int id, Product updated) =>
{
    var product = products.FirstOrDefault(p => p.Id == id);
    if (product is null) return Results.NotFound();

    product.Name = updated.Name;
    product.Description = updated.Description;
    product.Price = updated.Price;
    product.Stock = updated.Stock;

    return Results.Ok(product);
});

// DELETE /products/{id} - Elimina uno
app.MapDelete("/products/{id}", (int id) =>
{
    var product = products.FirstOrDefault(p => p.Id == id);
    if (product is null) return Results.NotFound();

    products.Remove(product);
    return Results.NoContent();
});

app.Run();