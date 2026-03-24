using Microsoft.EntityFrameworkCore;
using Neosoft.Api.Data;
using Neosoft.Api.Models;
using Neosoft.Api.Models.Entities;
using Neosoft.Api.Querying;

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

    public async Task<(IReadOnlyList<Variable> Items, int TotalCount)> GetPagedAsync(
        QueryParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Variables.AsNoTracking().AsQueryable().ApplyVariablePagedFilters(parameters);

        var totalCount = await query.CountAsync(cancellationToken);

        var pageIds = await query
            .OrderBy(v => v.Id)
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(v => v.Id)
            .ToListAsync(cancellationToken);

        if (pageIds.Count == 0)
        {
            return (Array.Empty<Variable>(), totalCount);
        }

        var items = await _context.Variables
            .AsNoTracking()
            .Where(v => pageIds.Contains(v.Id))
            .OrderBy(v => v.Id)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
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
