using Neosoft.Api.Models.DTOs;
using Neosoft.Api.Repositories;

namespace Neosoft.Api.Services;

public sealed class RoleService(IRoleRepository roleRepository) : IRoleService
{
    private readonly IRoleRepository _roleRepository = roleRepository;

    public async Task<IReadOnlyList<RoleListItemDto>> GetAllForDropdownAsync(CancellationToken cancellationToken = default)
    {
        var roles = await _roleRepository.GetAllOrderedByNameAsync(cancellationToken);
        return roles.Select(r => new RoleListItemDto(r.Id, r.Name)).ToList();
    }
}
