using Microsoft.EntityFrameworkCore;

namespace Okane.Api.Infrastructure.Database.HostedServices;

/// <summary>
/// Background service to remove inactive refresh tokens on a daily interval.
/// </summary>
/// <param name="scopeFactory"></param>
/// <see href="https://stackoverflow.com/a/71637260" />
public class RefreshTokenCleanupService(IServiceScopeFactory scopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
                await db.RefreshTokens.
                    Where(t => !t.IsActive).
                    ExecuteDeleteAsync(stoppingToken);
            }
            
            await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
        }
    }
}
