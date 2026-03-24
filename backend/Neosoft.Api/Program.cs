using DotNetEnv;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Neosoft.Api.Common;
using Neosoft.Api.Data;
using Neosoft.Api.DependencyInjection;
using Neosoft.Api.Validation;

// Cargar .env antes de CreateBuilder para que ConnectionStrings__DefaultConnection entre en IConfiguration.
var envFile = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envFile))
{
    Env.Load(envFile);
}

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = ModelStateValidationResponse.FromModelState;
});
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<UserCreateDtoValidator>();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

if (builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseInMemoryDatabase("NeosoftApiTests"));
}
else
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Falta ConnectionStrings:DefaultConnection. Copia .env.example como .env y configura MariaDB.");
        }

        if (Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true")
        {
            connectionString = EnsureDbServiceHost(connectionString);
        }

        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
    });
}

builder.Services.AddPersistence();
builder.Services.AddApplicationServices();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (!app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();

static string EnsureDbServiceHost(string connectionString)
{
    var parts = connectionString
        .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .ToList();

    for (var i = 0; i < parts.Count; i++)
    {
        var kv = parts[i].Split('=', 2, StringSplitOptions.TrimEntries);
        if (kv.Length != 2)
        {
            continue;
        }

        var key = kv[0];
        var value = kv[1];
        if ((key.Equals("Server", StringComparison.OrdinalIgnoreCase) ||
             key.Equals("Host", StringComparison.OrdinalIgnoreCase) ||
             key.Equals("Data Source", StringComparison.OrdinalIgnoreCase)) &&
            (value.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
             value.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase)))
        {
            parts[i] = $"{key}=db";
        }
    }

    return string.Join(';', parts) + ";";
}

public partial class Program;
