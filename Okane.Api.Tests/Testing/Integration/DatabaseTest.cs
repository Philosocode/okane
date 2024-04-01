using Okane.Api.Infrastructure.Database;

namespace Okane.Api.Tests.Testing.Integration;

[Collection(nameof(DatabaseTestCollection))]
public abstract class DatabaseTest(TestingApiFactory apiFactory) : IAsyncLifetime
{
    protected readonly ApiDbContext Db = apiFactory.Db;

    public Task InitializeAsync() => Task.CompletedTask;

    public Task DisposeAsync() => apiFactory.ResetDatabase();

    // Helpers.
    protected async Task InsertEntity<T>(T entity) where T : class
    {
        await Db.AddAsync(entity);
        await Db.SaveChangesAsync();
    }
}
