using Neosoft.Api.Common;
using Neosoft.Api.Models;
using Neosoft.Api.Models.DTOs;

namespace Neosoft.Api.Services;

public interface IRoleService
{
    Task<IReadOnlyList<RoleListItemDto>> GetAllForDropdownAsync(CancellationToken cancellationToken = default);

    Task<PagedResponse<RoleListItemDto>> GetAllAsync(QueryParameters parameters, CancellationToken cancellationToken = default);

    Task<RoleDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<ServiceResult<RoleDto>> CreateAsync(RoleDto dto, CancellationToken cancellationToken = default);

    Task<ServiceResult> UpdateAsync(int id, RoleDto dto, CancellationToken cancellationToken = default);

    Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
