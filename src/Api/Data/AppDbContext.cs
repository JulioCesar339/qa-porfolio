using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>(); // Tabla de productos
    public DbSet<User> Users => Set<User>();           // Tabla de usuarios
    public DbSet<Order> Orders => Set<Order>();        // Tabla de órdenes

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Datos iniciales de productos
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Laptop", Description = "Laptop gamer", Price = 15000, Stock = 10 },
            new Product { Id = 2, Name = "Mouse", Description = "Mouse inalambrico", Price = 500, Stock = 50 },
            new Product { Id = 3, Name = "Teclado", Description = "Teclado mecanico", Price = 1200, Stock = 30 }
        );

        // Datos iniciales de usuarios para pruebas
        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, Username = "admin", Password = "admin123", Role = "admin" },
            new User { Id = 2, Username = "user", Password = "user123", Role = "user" }
        );

        // Datos iniciales de órdenes
        modelBuilder.Entity<Order>().HasData(
            new Order { Id = 1, UserId = 1, ProductId = 1, Quantity = 1, Total = 15000, Status = "completed", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Order { Id = 2, UserId = 2, ProductId = 2, Quantity = 2, Total = 1000, Status = "pending", CreatedAt = new DateTime(2026, 1, 2, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}