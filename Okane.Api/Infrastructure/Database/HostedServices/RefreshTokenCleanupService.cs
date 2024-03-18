using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Config;

namespace Okane.Api.Infrastructure.Database.HostedServices;

/// <summary>
/// Background service to remove inactive refresh tokens on a daily interval.
/// </summary>
/// <param name="db"></param>
/// <see href="https://stackoverflow.com/a/71637260" />
public class RefreshTokenCleanupService(ApiDbContext db, JwtSettings jwtSettings) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromDays(1));
        while (await timer.WaitForNextTickAsync(cancellationToken))
        {
            await db.RefreshTokens.
                Where(t => !t.IsActive).
                ExecuteDeleteAsync(cancellationToken);
        }
    }
}
