using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Neosoft.Api.Data;
using Neosoft.Api.Models.Entities;

namespace Neosoft.Api.Tests;

[CollectionDefinition("ApiIntegration", DisableParallelization = true)]
public sealed class ApiIntegrationCollection
{
}

[Collection("ApiIntegration")]
public sealed class UsersApiIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public UsersApiIntegrationTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Post_usuario_devuelve_400_si_roleId_no_existe()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();

        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/users",
            new
            {
                fullName = "Usuario Test",
                email = "u@test.com",
                roleId = 99,
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        Assert.True(doc.RootElement.TryGetProperty("roleId", out var roleErr));
        Assert.Equal(JsonValueKind.Array, roleErr.ValueKind);
        Assert.True(roleErr.GetArrayLength() > 0);
    }

    [Fact]
    public async Task Post_usuario_devuelve_400_y_mensajes_por_campo_si_email_invalido()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();

        db.Roles.Add(new Role { Name = "Admin" });
        await db.SaveChangesAsync();
        var roleId = await db.Roles.Select(r => r.Id).FirstAsync();

        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/users",
            new
            {
                fullName = "Usuario Test",
                email = "no-es-correo",
                roleId = roleId,
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        Assert.True(doc.RootElement.TryGetProperty("email", out var emailErr));
        Assert.Equal(JsonValueKind.Array, emailErr.ValueKind);
        Assert.Contains("correo", emailErr[0].GetString(), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Post_usuario_devuelve_201_cuando_rol_existe()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();

        db.Roles.Add(new Role { Name = "Admin" });
        await db.SaveChangesAsync();
        var roleId = await db.Roles.Select(r => r.Id).FirstAsync();

        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/users",
            new
            {
                fullName = "Usuario Test",
                email = "ok@test.com",
                roleId = roleId,
            });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Get_usuarios_con_filterId_devuelve_paginado_y_solo_el_usuario_filtrado()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();

        db.Roles.Add(new Role { Name = "Admin" });
        await db.SaveChangesAsync();
        var roleId = await db.Roles.Select(r => r.Id).FirstAsync();

        for (var i = 0; i < 3; i++)
        {
            db.Users.Add(new User { FullName = $"Usuario {i}", Email = $"u{i}@test.com", RoleId = roleId });
        }

        await db.SaveChangesAsync();

        var targetId = await db.Users.OrderBy(u => u.Id).Skip(1).Select(u => u.Id).FirstAsync();

        var client = _factory.CreateClient();
        var response = await client.GetAsync($"/api/users?pageNumber=1&pageSize=10&filterId={targetId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        Assert.Equal(JsonValueKind.Object, doc.RootElement.ValueKind);
        Assert.True(doc.RootElement.TryGetProperty("items", out var items));
        Assert.Equal(1, items.GetArrayLength());
        Assert.Equal(targetId, items[0].GetProperty("id").GetInt32());
        Assert.True(doc.RootElement.TryGetProperty("totalCount", out var totalCount));
        Assert.Equal(1, totalCount.GetInt32());
    }
}
