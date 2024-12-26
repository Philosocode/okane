using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Infrastructure.Database.Constants;

namespace Okane.Api.Infrastructure.Database;

public class ApiDbContext(DbContextOptions<ApiDbContext> options) : IdentityDbContext<ApiUser>(options)
{
    public DbSet<FinanceRecord> FinanceRecords { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.HasPostgresEnum<FinanceRecordType>();
        builder.HasCollation(
            DbConstants.CaseInsensitiveCollation,
            "en-u-ks-primary",
            "icu",
            false
        );
        builder.ApplyConfigurationsFromAssembly(typeof(ApiDbContext).Assembly);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder builder)
    {
        base.OnConfiguring(builder);
    }
}
