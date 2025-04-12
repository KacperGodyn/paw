namespace PawApi.Models;

public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Login { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "developer";
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
} 