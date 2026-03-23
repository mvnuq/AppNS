namespace Neosoft.Api.Data;

/// <summary>
/// Abstraction over persistence (Unit of Work). Keeps services independent of DbContext details.
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
