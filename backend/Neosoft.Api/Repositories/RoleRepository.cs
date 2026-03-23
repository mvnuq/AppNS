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

    public async Task<Role?> GetByIdReadOnlyAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<Role?> GetByIdTrackedAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Roles
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public Task<bool> HasUsersAsync(int roleId, CancellationToken cancellationToken = default) =>
        _context.Users.AnyAsync(u => u.RoleId == roleId, cancellationToken);

    public Task AddAsync(Role role, CancellationToken cancellationToken = default)
    {
        _context.Roles.Add(role);
        return Task.CompletedTask;
    }

    public void Remove(Role role) => _context.Roles.Remove(role);
}
