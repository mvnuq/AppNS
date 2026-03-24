using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Neosoft.Api.Logging;
using Neosoft.Api.Models.Entities;

namespace Neosoft.Api.Data;

public class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    ILogger<ApplicationDbContext> logger,
    IAuditLogFileWriter auditLogFile) : DbContext(options)
{
    private readonly ILogger<ApplicationDbContext> _logger = logger;
    private readonly IAuditLogFileWriter _auditLogFile = auditLogFile;

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Variable> Variables => Set<Variable>();

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ApplyAuditing();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditing();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyAuditing()
    {
        var utcNow = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<User>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = utcNow;
                entry.Entity.UpdatedAt = utcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = utcNow;
            }
        }

        foreach (var entry in ChangeTracker.Entries<Variable>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = utcNow;
                entry.Entity.UpdatedAt = utcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = utcNow;
            }
        }

        foreach (var entry in ChangeTracker.Entries<Role>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = utcNow;
                entry.Entity.UpdatedAt = utcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = utcNow;
            }
        }

        foreach (var entry in ChangeTracker.Entries<User>())
        {
            if (entry.State == EntityState.Modified)
            {
                LogAudit("UPDATE", nameof(User), entry.Entity.Id, utcNow);
            }
        }

        foreach (var entry in ChangeTracker.Entries<Variable>())
        {
            if (entry.State == EntityState.Modified)
            {
                LogAudit("UPDATE", nameof(Variable), entry.Entity.Id, utcNow);
            }
        }

        foreach (var entry in ChangeTracker.Entries<User>())
        {
            if (entry.State == EntityState.Deleted)
            {
                LogAudit("DELETE", nameof(User), entry.Entity.Id, utcNow);
            }
        }

        foreach (var entry in ChangeTracker.Entries<Variable>())
        {
            if (entry.State == EntityState.Deleted)
            {
                LogAudit("DELETE", nameof(Variable), entry.Entity.Id, utcNow);
            }
        }

        foreach (var entry in ChangeTracker.Entries<Role>())
        {
            if (entry.State == EntityState.Deleted)
            {
                LogAudit("DELETE", nameof(Role), entry.Entity.Id, utcNow);
            }
        }
    }

    private void LogAudit(string action, string entityName, int entityId, DateTime utcNow)
    {
        _logger.LogInformation(
            "Auditoría: {Action} {EntityName} Id={EntityId} a {TimestampChile} (Chile)",
            action,
            entityName,
            entityId,
            ChileTime.FormatForLog(utcNow));
        _auditLogFile.AppendLine(action, entityName, entityId, utcNow);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.FullName).HasColumnName("full_name").IsRequired();
            entity.Property(e => e.Email).HasColumnName("email").IsRequired();
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasOne(e => e.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(e => e.RoleId);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        modelBuilder.Entity<Variable>(entity =>
        {
            entity.ToTable("variables");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").IsRequired();
            entity.Property(e => e.Value).HasColumnName("value").IsRequired();
            entity.Property(e => e.Type).HasColumnName("type").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });
    }
}
