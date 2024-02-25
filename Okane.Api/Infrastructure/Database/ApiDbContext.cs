using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Okane.Api.Features.Auth.Models;

namespace Okane.Api.Infrastructure.Database;

public class ApiDbContext(IOptions<DbSettings> options) : IdentityDbContext<ApiUser>
{
    protected override void OnConfiguring(DbContextOptionsBuilder builder)
    {
        builder.UseNpgsql(options.Value.ConnectionString);
    }
}
