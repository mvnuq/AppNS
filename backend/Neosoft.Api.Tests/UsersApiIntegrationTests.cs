using System.Net;
using System.Net.Http.Json;
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
}
