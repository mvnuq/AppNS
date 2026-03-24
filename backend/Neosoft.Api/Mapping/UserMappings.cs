using Neosoft.Api.Models.DTOs;
using Neosoft.Api.Models.Entities;

namespace Neosoft.Api.Mapping;

public static class UserMappings
{
    public static UserDto ToDto(this User user)
    {
        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            RoleId = user.RoleId,
            RoleName = user.Role?.Name ?? string.Empty,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
        };
    }
}
