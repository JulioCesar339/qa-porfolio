using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Tabla de productos en la base de datos
    public DbSet<Product> Products => Set<Product>();

    // Tabla de usuarios en la base de datos
    public DbSet<User> Users => Set<User>();

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
    }
}