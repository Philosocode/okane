using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Infrastructure.Database;

namespace Okane.Api.Tests.Testing.Integration;

// Referenced: https://stackoverflow.com/q/67174971
public class InMemoryContextFactory : IDisposable
{
    private readonly SqliteConnection _connection;

    public InMemoryContextFactory()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.CreateFunction("now", () => DateTime.UtcNow);
        _connection.Open();

        DbContextOptions<ApiDbContext> options = CreateOptions();
        using var db = new ApiDbContext(options);
        db.Database.EnsureCreated();
    }

    public void Dispose()
    {
        _connection.Dispose();
    }

    public ApiDbContext CreateContext()
    {
        return new ApiDbContext(CreateOptions());
    }

    private DbContextOptions<ApiDbContext> CreateOptions()
    {
        return new DbContextOptionsBuilder<ApiDbContext>()
            .UseSqlite(_connection)
            .Options;
    }
}
