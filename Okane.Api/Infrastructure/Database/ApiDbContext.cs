using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Okane.Api.Infrastructure.Database;

public class ApiDbContext(IOptions<DbSettings> options) : DbContext
{
    protected override void OnConfiguring(DbContextOptionsBuilder builder)
    {
        builder.UseNpgsql(options.Value.ConnectionString);
    }
}
