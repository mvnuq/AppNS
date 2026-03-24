using Neosoft.Api.Models;
using Neosoft.Api.Models.Entities;

namespace Neosoft.Api.Repositories;

public interface IUserRepository
{
    Task<IReadOnlyList<User>> GetAllWithRoleAsync(CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<User> Items, int TotalCount)> GetPagedWithRoleAsync(
        QueryParameters parameters,
        CancellationToken cancellationToken = default);

    Task<User?> GetByIdWithRoleAsync(int id, CancellationToken cancellationToken = default);

    Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task AddAsync(User user, CancellationToken cancellationToken = default);

    void Remove(User user);
}
