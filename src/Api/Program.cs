using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// ─── Configuración de OpenAPI/Scalar ───────────────────────────────────────
builder.Services.AddOpenApi();

// ─── Configuración de la base de datos ─────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ─── Configuración de JWT ───────────────────────────────────────────────────
var jwtSecret = builder.Configuration["JWT_SECRET"]       // Clave secreta desde .env
    ?? "clave-por-defecto-solo-para-desarrollo";
var jwtIssuer = builder.Configuration["JWT_ISSUER"]       // Emisor del token
    ?? "qa-portfolio-api";
var jwtAudience = builder.Configuration["JWT_AUDIENCE"]   // Receptor del token
    ?? "qa-portfolio-client";

// Registra el servicio de autenticación con JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,           // Valida que el emisor sea correcto
            ValidateAudience = true,         // Valida que el receptor sea correcto
            ValidateLifetime = true,         // Valida que el token no haya expirado
            ValidateIssuerSigningKey = true, // Valida la firma del token
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

// Registra el servicio de autorización
builder.Services.AddAuthorization();

var app = builder.Build();

// ─── Documentación ──────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// ─── Middlewares de autenticación y autorización ────────────────────────────
app.UseAuthentication(); // Verifica quién eres
app.UseAuthorization();  // Verifica qué puedes hacer

// ─── Migraciones automáticas al iniciar ─────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// ─── Endpoint de login ───────────────────────────────────────────────────────
app.MapPost("/auth/login", async (LoginRequest request, AppDbContext db) =>
{
    // Busca el usuario en la base de datos
    var user = await db.Users.FirstOrDefaultAsync(u =>
        u.Username == request.Username && u.Password == request.Password);

    // Si no existe, devuelve 401 Unauthorized
    if (user is null)
        return Results.Unauthorized();

    // Crea los claims (datos que irán dentro del token)
    var claims = new[]
    {
        new Claim(ClaimTypes.Name, user.Username),   // Nombre de usuario
        new Claim(ClaimTypes.Role, user.Role),        // Rol del usuario
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // ID único del token
    };

    // Genera el token firmado
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken(
        issuer: jwtIssuer,
        audience: jwtAudience,
        claims: claims,
        expires: DateTime.UtcNow.AddHours(1), // El token expira en 1 hora
        signingCredentials: credentials
    );

    // Devuelve el token y los datos del usuario
    return Results.Ok(new LoginResponse
    {
        Token = new JwtSecurityTokenHandler().WriteToken(token),
        Username = user.Username,
        Role = user.Role
    });
});

// ─── Endpoints de productos (protegidos con JWT) ─────────────────────────────

// GET /products - Lista todos (requiere autenticación)
app.MapGet("/products", async (AppDbContext db) =>
{
    return Results.Ok(await db.Products.ToListAsync());
}).RequireAuthorization();

// GET /products/{id} - Obtiene uno (requiere autenticación)
app.MapGet("/products/{id}", async (int id, AppDbContext db) =>
{
    var product = await db.Products.FindAsync(id);
    return product is not null ? Results.Ok(product) : Results.NotFound();
}).RequireAuthorization();

// POST /products - Crea uno nuevo (requiere autenticación)
app.MapPost("/products", async (Product product, AppDbContext db) =>
{
    db.Products.Add(product);
    await db.SaveChangesAsync();
    return Results.Created($"/products/{product.Id}", product);
}).RequireAuthorization();

// PUT /products/{id} - Actualiza uno (requiere autenticación)
app.MapPut("/products/{id}", async (int id, Product updated, AppDbContext db) =>
{
    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();

    product.Name = updated.Name;
    product.Description = updated.Description;
    product.Price = updated.Price;
    product.Stock = updated.Stock;

    await db.SaveChangesAsync();
    return Results.Ok(product);
}).RequireAuthorization();

// DELETE /products/{id} - Elimina uno (requiere autenticación)
app.MapDelete("/products/{id}", async (int id, AppDbContext db) =>
{
    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();

    db.Products.Remove(product);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

app.Run();