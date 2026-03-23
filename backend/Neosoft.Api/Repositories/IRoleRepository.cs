using Neosoft.Api.Models.Entities;

namespace Neosoft.Api.Repositories;

public interface IRoleRepository
{
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Role>> GetAllOrderedByNameAsync(CancellationToken cancellationToken = default);
}
