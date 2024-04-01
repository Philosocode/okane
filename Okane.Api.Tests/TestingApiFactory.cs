using System.Data.Common;
using DotNet.Testcontainers.Builders;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Tests.Tests.Extensions;
using Respawn;
using Testcontainers.PostgreSql;

namespace Okane.Api.Tests;

[CollectionDefinition(nameof(DatabaseTestCollection))]
public class DatabaseTestCollection : ICollectionFixture<TestingApiFactory>;

// Referenced: https://github.com/danielwarddev/TestingWithDb
public class TestingApiFactory : WebApplicationFactory<IApiMarker>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _container =
        new PostgreSqlBuilder()
            .WithImage("postgres:latest")
            .WithDatabase("okane")
            .WithUsername("okane")
            .WithPassword("okane")
            .WithWaitStrategy(Wait.ForUnixContainer().UntilCommandIsCompleted("pg_isready"))
            .WithCleanUp(true)
            .Build();

    public ApiDbContext Db { get; private set; } = null!;
    private Respawner _respawner = null!;
    private DbConnection _connection = null!;
    
    public async Task ResetDatabase()
    {
        await _respawner.ResetAsync(_connection);
    }
    
    public async Task InitializeAsync()
    {
        await _container.StartAsync();
        
        Db = Services.CreateScope().ServiceProvider.GetRequiredService<ApiDbContext>();
        _connection = Db.Database.GetDbConnection();
        await _connection.OpenAsync();
        
        _respawner = await Respawner.CreateAsync(_connection, new RespawnerOptions
        {
            DbAdapter = DbAdapter.Postgres,
            SchemasToInclude = ["public"]
        });
    }

    public new async Task DisposeAsync()
    {
        await _connection.CloseAsync();
        await _container.DisposeAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            services.RemoveDbContext();
            services.AddDbContext<ApiDbContext>(options =>
            {
                options.UseNpgsql(_container.GetConnectionString());
            });
            services.EnsureDbCreated();
            
            services.RemoveAll<IHostedService>();
        });
    }
}
