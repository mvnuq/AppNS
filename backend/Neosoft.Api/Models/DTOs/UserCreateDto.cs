namespace Neosoft.Api.Models.DTOs;

public class UserCreateDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int RoleId { get; set; }
}
