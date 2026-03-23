using Microsoft.EntityFrameworkCore;
using Neosoft.Api.Models.Entities;

namespace Neosoft.Api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Variable> Variables => Set<Variable>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.FullName).IsRequired();
            entity.Property(e => e.Email).IsRequired();

            entity.HasOne(e => e.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(e => e.RoleId);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
        });

        modelBuilder.Entity<Variable>(entity =>
        {
            entity.ToTable("variables");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Value).IsRequired();
            entity.Property(e => e.Type).IsRequired();
        });
    }
}
