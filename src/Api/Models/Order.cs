namespace Api.Models;

// Representa una orden de compra en el sistema
public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }        // Usuario que realizó la orden
    public int ProductId { get; set; }     // Producto ordenado
    public int Quantity { get; set; }      // Cantidad de productos
    public decimal Total { get; set; }     // Total de la orden
    public string Status { get; set; } = "pending"; // Estado: pending, completed, cancelled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Fecha de creación
}