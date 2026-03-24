using Neosoft.Api.Models;
using Neosoft.Api.Models.Entities;

namespace Neosoft.Api.Repositories;

public interface IVariableRepository
{
    Task<IReadOnlyList<Variable>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<Variable> Items, int TotalCount)> GetPagedAsync(
        QueryParameters parameters,
        CancellationToken cancellationToken = default);

    Task<Variable?> GetByIdReadOnlyAsync(int id, CancellationToken cancellationToken = default);

    Task<Variable?> GetByIdTrackedAsync(int id, CancellationToken cancellationToken = default);

    Task AddAsync(Variable variable, CancellationToken cancellationToken = default);

    void Remove(Variable variable);
}
