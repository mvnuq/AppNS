using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Neosoft.Api.Data;

namespace Neosoft.Api.Tests;

[Collection("ApiIntegration")]
public sealed class VariablesApiIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public VariablesApiIntegrationTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Post_variable_devuelve_400_con_error_type_si_no_se_envia_type()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();

        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/v1/variables",
            new
            {
                name = "ConfigA",
                value = "123"
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        Assert.True(doc.RootElement.TryGetProperty("type", out var typeErr));
        Assert.Equal(JsonValueKind.Array, typeErr.ValueKind);
        Assert.True(typeErr.GetArrayLength() > 0);
    }
}
