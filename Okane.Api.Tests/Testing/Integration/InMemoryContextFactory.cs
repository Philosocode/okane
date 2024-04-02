using System.Data.Common;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Infrastructure.Database;

namespace Okane.Api.Tests.Testing.Integration;

// Referenced: https://stackoverflow.com/q/67174971
public class InMemoryContextFactory : IDisposable
{
    private readonly DbConnection _connection;

    public InMemoryContextFactory()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = CreateOptions();
        using var db = new ApiDbContext(options);
        db.Database.EnsureCreated();
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

    public void Dispose()
    {
        _connection.Dispose();
    }
}
