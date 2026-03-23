using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Neosoft.Api.Tests;

/// <summary>
/// Host de pruebas con entorno <c>Testing</c> (BD en memoria según <see cref="Program"/>).
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
    }
}
