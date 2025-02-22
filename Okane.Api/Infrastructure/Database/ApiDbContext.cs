using System.Reflection;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Tags.Entities;
using Okane.Api.Infrastructure.Database.Constants;

namespace Okane.Api.Infrastructure.Database;

public class ApiDbContext(DbContextOptions<ApiDbContext> options) : IdentityDbContext<ApiUser>(options)
{
    public DbSet<FinanceRecord> FinanceRecords { get; set; } = null!;
    public DbSet<FinanceRecordTag> FinanceRecordTags { get; set; } = null!;
    public DbSet<FinanceUserTag> FinanceUserTags { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;

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

        // Example usage:
        // ctx.Entity.Where(e => ApiDbContext.DateTrunc("weeks", e.CreatedAt) == new DateTime(2000, 1, 1)).ToList()
        // See: https://github.com/npgsql/efcore.pg/issues/1487#issuecomment-1257033552
        builder.HasDbFunction(s_dateTruncMethod).HasName("date_trunc").IsBuiltIn();
    }

    protected override void OnConfiguring(DbContextOptionsBuilder builder)
    {
        base.OnConfiguring(builder);
    }

    // date_trunc
    private static readonly MethodInfo s_dateTruncMethod = typeof(ApiDbContext)
        .GetRuntimeMethod(nameof(DateTrunc), new[] { typeof(string), typeof(DateTime) })!;

    public static DateTime DateTrunc(string interval, DateTime dateTime)
    {
        throw new NotSupportedException();
    }
}
