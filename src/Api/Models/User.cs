namespace Api.Models;

// Modelo que representa un usuario en el sistema
public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty; // Nombre de usuario único
    public string Password { get; set; } = string.Empty; // Contraseña (en producción se hashea)
    public string Role { get; set; } = "user";           // Rol del usuario: "user" o "admin"
}

// Modelo para recibir las credenciales en el login
public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

// Modelo para devolver el token al cliente
public class LoginResponse
{
    public string Token { get; set; } = string.Empty;    // JWT token generado
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}