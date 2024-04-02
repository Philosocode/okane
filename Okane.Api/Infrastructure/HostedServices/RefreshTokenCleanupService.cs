using Microsoft.EntityFrameworkCore;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Shared.Wrappers;

namespace Okane.Api.Infrastructure.HostedServices;

/// <summary>
/// Background service to remove inactive refresh tokens on a daily interval.
/// </summary>
/// <param name="scopeFactory"></param>
/// <see href="https://stackoverflow.com/a/71637260" />
public class RefreshTokenCleanupService(IServiceScopeFactory scopeFactory)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromDays(1));
        while (await timer.WaitForNextTickAsync(stoppingToken) && !stoppingToken.IsCancellationRequested)
        {
            using IServiceScope scope = scopeFactory.CreateScope();
            var cleaner = scope.ServiceProvider.GetRequiredService<RefreshTokenCleaner>();
            await cleaner.ExecuteAsync(stoppingToken);
        }
    }
}

/// <summary>
/// Class that houses the business logic for removing expired and revoked refresh tokens. 
/// </summary>
/// <param name="db"></param>
/// <param name="logger"></param>
internal class RefreshTokenCleaner(
    IDateTimeWrapper dateTime,
    ApiDbContext db,
    ILogger<RefreshTokenCleaner> logger) : IHostedServiceHelper
{
    public async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        int deletedCount = await db.RefreshTokens
            .Where(t => dateTime.UtcNow >= t.ExpiresAt || t.RevokedAt != null)
            .ExecuteDeleteAsync(stoppingToken);

        logger.LogInformation("RefreshTokenCleaner: Deleted {Count} refresh tokens", deletedCount);
    }
}
