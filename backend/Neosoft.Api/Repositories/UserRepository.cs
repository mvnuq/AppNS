using Microsoft.EntityFrameworkCore;
using Neosoft.Api.Data;
using Neosoft.Api.Models.Entities;

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
