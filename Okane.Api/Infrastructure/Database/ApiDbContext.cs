using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Okane.Api.Features.Auth.Entities;

namespace Okane.Api.Infrastructure.Database;

public class ApiDbContext(IOptions<DbSettings> options) : IdentityDbContext<ApiUser>
{
    public DbSet<RefreshToken> RefreshTokens { get; set; } = default!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApiDbContext).Assembly);
    }
    
    protected override void OnConfiguring(DbContextOptionsBuilder builder)
    {
        base.OnConfiguring(builder);
        builder.UseNpgsql(options.Value.ConnectionString);
    }
}
