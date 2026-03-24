using Neosoft.Api.Models.DTOs;
using Neosoft.Api.Models.Entities;

namespace Neosoft.Api.Mapping;

public static class VariableMappings
{
    public static VariableDto ToDto(this Variable variable)
    {
        return new VariableDto
        {
            Id = variable.Id,
            Name = variable.Name,
            Value = variable.Value,
            Type = variable.Type,
            CreatedAt = variable.CreatedAt,
            UpdatedAt = variable.UpdatedAt,
        };
    }
}
