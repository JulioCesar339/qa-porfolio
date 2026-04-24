using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Laptop", Description = "Laptop gamer", Price = 15000, Stock = 10 },
            new Product { Id = 2, Name = "Mouse", Description = "Mouse inalambrico", Price = 500, Stock = 50 },
            new Product { Id = 3, Name = "Teclado", Description = "Teclado mecanico", Price = 1200, Stock = 30 }
        );
    }
}