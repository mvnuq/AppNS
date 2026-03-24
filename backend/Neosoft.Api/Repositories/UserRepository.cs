using Microsoft.EntityFrameworkCore;
using Neosoft.Api.Data;
using Neosoft.Api.Models;
using Neosoft.Api.Models.Entities;
using Neosoft.Api.Querying;

namespace Neosoft.Api.Repositories;

public sealed class UserRepository(ApplicationDbContext context) : IUserRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<IReadOnlyList<User>> GetAllWithRoleAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .OrderBy(u => u.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<User> Items, int TotalCount)> GetPagedWithRoleAsync(
        QueryParameters parameters,
        CancellationToken cancellationToken = default)
    {
        // Sin Include aquí: filtrar y contar solo sobre Users; si no, EF puede generar
        // un split/cartesiano donde el WHERE no acota el resultado como se espera.
        var query = _context.Users
            .AsNoTracking()
            .AsQueryable()
            .ApplyUserPagedFilters(parameters);

        var totalCount = await query.CountAsync(cancellationToken);

        // Paginar solo por Id (sin Include) para que el LIMIT se aplique en SQL de forma fiable.
        var pageIds = await query
            .OrderBy(u => u.Id)
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(u => u.Id)
            .ToListAsync(cancellationToken);

        if (pageIds.Count == 0)
        {
            return (Array.Empty<User>(), totalCount);
        }

        var items = await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .Where(u => pageIds.Contains(u.Id))
            .OrderBy(u => u.Id)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<User?> GetByIdWithRoleAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.Users.Add(user);
        return Task.CompletedTask;
    }

    public void Remove(User user) => _context.Users.Remove(user);
}
