using Neosoft.Api.Models;
using Neosoft.Api.Models.Entities;

namespace Neosoft.Api.Repositories;

public interface IRoleRepository
{
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Role>> GetAllOrderedByNameAsync(CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Role> Items, int TotalCount)> GetPagedAsync(
        QueryParameters parameters,
        CancellationToken cancellationToken = default);

    Task<Role?> GetByIdReadOnlyAsync(int id, CancellationToken cancellationToken = default);

    Task<Role?> GetByIdTrackedAsync(int id, CancellationToken cancellationToken = default);

    Task<bool> HasUsersAsync(int roleId, CancellationToken cancellationToken = default);

    Task AddAsync(Role role, CancellationToken cancellationToken = default);

    void Remove(Role role);
}
