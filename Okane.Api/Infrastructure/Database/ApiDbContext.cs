using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Finances.Entities;

namespace Okane.Api.Infrastructure.Database;

public class ApiDbContext(DbContextOptions<ApiDbContext> options) : IdentityDbContext<ApiUser>(options)
{
    public DbSet<FinanceRecord> FinanceRecords { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApiDbContext).Assembly);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder builder)
    {
        base.OnConfiguring(builder);
    }
}
