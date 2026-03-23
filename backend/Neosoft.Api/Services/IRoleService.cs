using Neosoft.Api.Models.DTOs;

namespace Neosoft.Api.Services;

public interface IRoleService
{
    Task<IReadOnlyList<RoleListItemDto>> GetAllForDropdownAsync(CancellationToken cancellationToken = default);
}
