using Microsoft.EntityFrameworkCore;

namespace Okane.Api.Infrastructure.Database.HostedServices;

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
            var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
            int deletedCount = await db.RefreshTokens
                .Where(t => DateTime.UtcNow >= t.ExpiresAt || t.RevokedAt != null)
                .ExecuteDeleteAsync(stoppingToken);

            Console.WriteLine($"Deleted {deletedCount} refresh tokens.");
        }
    }
}
