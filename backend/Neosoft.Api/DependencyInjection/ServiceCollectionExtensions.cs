using Neosoft.Api.Data;
using Neosoft.Api.Logging;
using Neosoft.Api.Repositories;
using Neosoft.Api.Services;

namespace Neosoft.Api.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPersistence(this IServiceCollection services)
    {
        services.AddSingleton<IAuditLogFileWriter, AuditLogFileWriter>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IVariableRepository, VariableRepository>();
        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IVariableService, VariableService>();
        return services;
    }
}
