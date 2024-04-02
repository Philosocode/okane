using Okane.Api.Infrastructure.Database;

namespace Okane.Api.Tests.Testing.Integration;

[Collection(nameof(DatabaseTestCollection))]
public abstract class DatabaseTest(PostgresApiFactory apiFactory) : IAsyncLifetime
{
    protected readonly ApiDbContext Db = apiFactory.Db;

    public Task InitializeAsync() => Task.CompletedTask;

    public Task DisposeAsync() => apiFactory.ResetDatabaseAsync();
}
