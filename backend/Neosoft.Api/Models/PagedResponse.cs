using Newtonsoft.Json;

namespace Neosoft.Api.Models;

public sealed class PagedResponse<T>
{
    [JsonProperty("items")]
    public required IReadOnlyList<T> Items { get; init; }

    [JsonProperty("totalCount")]
    public int TotalCount { get; init; }

    [JsonProperty("totalPages")]
    public int TotalPages { get; init; }
}
