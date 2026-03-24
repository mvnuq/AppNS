using Neosoft.Api.Models;
using Neosoft.Api.Models.Entities;

namespace Neosoft.Api.Querying;

/// <summary>
/// Aplica filtros de listado antes de contar y paginar (misma semántica que UserService/VariableService).
/// </summary>
public static class PagedQueryableExtensions
{
    public static IQueryable<User> ApplyUserPagedFilters(this IQueryable<User> query, QueryParameters parameters)
    {
        if (parameters.FilterId.HasValue)
        {
            var id = parameters.FilterId.Value;
            query = query.Where(u => u.Id == id);
        }

        if (!string.IsNullOrWhiteSpace(parameters.FilterName))
        {
            var term = parameters.FilterName!.Trim().ToLowerInvariant();
            query = query.Where(u => u.FullName.ToLower().Contains(term));
        }

        return query;
    }

    public static IQueryable<Variable> ApplyVariablePagedFilters(this IQueryable<Variable> query, QueryParameters parameters)
    {
        if (parameters.FilterId.HasValue)
        {
            var id = parameters.FilterId.Value;
            query = query.Where(v => v.Id == id);
        }

        if (!string.IsNullOrWhiteSpace(parameters.FilterName))
        {
            var term = parameters.FilterName!.Trim().ToLowerInvariant();
            query = query.Where(v => v.Name.ToLower().Contains(term));
        }

        return query;
    }

    public static IQueryable<Role> ApplyRolePagedFilters(this IQueryable<Role> query, QueryParameters parameters)
    {
        if (parameters.FilterId.HasValue)
        {
            var id = parameters.FilterId.Value;
            query = query.Where(r => r.Id == id);
        }

        if (!string.IsNullOrWhiteSpace(parameters.FilterName))
        {
            var term = parameters.FilterName!.Trim().ToLowerInvariant();
            query = query.Where(r => r.Name.ToLower().Contains(term));
        }

        return query;
    }
}
