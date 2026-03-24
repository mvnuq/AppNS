namespace Neosoft.Api.Models.DTOs;

/// <summary>
/// Rol en listados y dropdown (sin navegaciones).
/// </summary>
public sealed record RoleListItemDto(int Id, string Name, DateTime CreatedAt, DateTime? UpdatedAt);
