using Microsoft.EntityFrameworkCore;
using Neosoft.Api.Data;
using Neosoft.Api.Models.Entities;

namespace Neosoft.Api.Repositories;

public sealed class VariableRepository(ApplicationDbContext context) : IVariableRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<IReadOnlyList<Variable>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Variables
            .AsNoTracking()
            .OrderBy(v => v.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<Variable?> GetByIdReadOnlyAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Variables
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }

    public async Task<Variable?> GetByIdTrackedAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Variables
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }

    public Task AddAsync(Variable variable, CancellationToken cancellationToken = default)
    {
        _context.Variables.Add(variable);
        return Task.CompletedTask;
    }

    public void Remove(Variable variable) => _context.Variables.Remove(variable);
}
