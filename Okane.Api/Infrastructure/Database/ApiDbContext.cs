using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Entities;

namespace Okane.Api.Infrastructure.Database;

public class ApiDbContext : IdentityDbContext<ApiUser>
{
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
    {
    }

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
