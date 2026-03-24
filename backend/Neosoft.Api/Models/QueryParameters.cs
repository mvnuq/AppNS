namespace Neosoft.Api.Models;

/// <summary>
/// Parámetros de consulta para listados paginados y filtrados (API query string).
/// </summary>
public sealed class QueryParameters
{
    public int PageNumber { get; set; } = 1;

    public int PageSize { get; set; } = 10;

    /// <summary>Filtro exacto por ID (opcional).</summary>
    public int? FilterId { get; set; }

    /// <summary>Filtro parcial por nombre (usuarios: nombre completo; variables: nombre).</summary>
    public string? FilterName { get; set; }

    /// <summary>
    /// Valores seguros para paginación (defaults: primera página, 10 ítems; tamaño máximo acotado).
    /// </summary>
    public QueryParameters Normalized()
    {
        var page = PageNumber < 1 ? 1 : PageNumber;
        var size = PageSize < 1 ? 10 : Math.Min(PageSize, 100);
        int? filterId = !FilterId.HasValue || FilterId.Value < 1 ? null : FilterId;
        var filterName = string.IsNullOrWhiteSpace(FilterName) ? null : FilterName.Trim();
        return new QueryParameters
        {
            PageNumber = page,
            PageSize = size,
            FilterId = filterId,
            FilterName = filterName,
        };
    }
}
