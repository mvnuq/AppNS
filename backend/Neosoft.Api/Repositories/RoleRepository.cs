using Microsoft.EntityFrameworkCore;
using Neosoft.Api.Data;
using Neosoft.Api.Models.Entities;

namespace Neosoft.Api.Repositories;

public sealed class RoleRepository(ApplicationDbContext context) : IRoleRepository
{
    private readonly ApplicationDbContext _context = context;

    public Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Roles.AnyAsync(r => r.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Role>> GetAllOrderedByNameAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Roles
            .AsNoTracking()
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);
    }
}
