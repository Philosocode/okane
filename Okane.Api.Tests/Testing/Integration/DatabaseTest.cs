using Okane.Api.Infrastructure.Database;

namespace Okane.Api.Tests.Testing.Integration;

[Collection(nameof(DatabaseTestCollection))]
public abstract class DatabaseTest(PostgresApiFactory apiFactory) : IAsyncLifetime
{
    protected readonly ApiDbContext Db = apiFactory.Db;

    public Task InitializeAsync()
    {
        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        return apiFactory.ResetDatabaseAsync();
    }
}
