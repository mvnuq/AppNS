namespace Neosoft.Api.Models.DTOs;

/// <summary>
/// Minimal role data for dropdowns (avoids exposing entity navigation properties).
/// </summary>
public sealed record RoleListItemDto(int Id, string Name);
