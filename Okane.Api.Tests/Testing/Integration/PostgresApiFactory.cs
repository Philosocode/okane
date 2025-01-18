using System.Data.Common;
using DotNet.Testcontainers.Builders;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Emails.Services;
using Okane.Api.Tests.Testing.Extensions;
using Okane.Api.Tests.Testing.Mocks.Wrappers;
using Respawn;
using Serilog;
using Serilog.AspNetCore;
using Serilog.Events;
using Testcontainers.PostgreSql;
using ILoggerFactory = Microsoft.Extensions.Logging.ILoggerFactory;

namespace Okane.Api.Tests.Testing.Integration;

[CollectionDefinition(nameof(DatabaseTestCollection))]
public class DatabaseTestCollection : ICollectionFixture<PostgresApiFactory>;

// Referenced: https://github.com/danielwarddev/TestingWithDb
public class PostgresApiFactory : WebApplicationFactory<IApiMarker>, IAsyncLifetime
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

    private DbConnection _connection = null!;
    private Respawner _respawner = null!;

    public ApiDbContext Db { get; private set; } = null!;

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

    public async Task ResetDatabaseAsync()
    {
        await _respawner.ResetAsync(_connection);
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

            services.Configure<IdentityOptions>(options =>
            {
                options.SignIn.RequireConfirmedEmail = false;
            });

            services.RemoveAll<ISmtpClientGenerator>();
            services.AddScoped<ISmtpClientGenerator, TestingSmtpClientGenerator>();

            services.AddSingleton<ILoggerFactory, NullLoggerFactory>();

            services.RemoveAll<IHostedService>();
        });

        base.ConfigureWebHost(builder);
    }
}
