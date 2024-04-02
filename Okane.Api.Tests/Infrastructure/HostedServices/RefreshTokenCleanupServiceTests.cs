using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.HostedServices;
using Okane.Api.Shared.Wrappers;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.Mocks.Wrappers;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Infrastructure.HostedServices;

public class RefreshTokenCleanupServiceTests
{
    private readonly InMemoryContextFactory _contextFactory = new();
    private readonly IDateTimeWrapper _dateTimeWrapper = new TestingDateTimeWrapper();

    private readonly ILogger<RefreshTokenCleaner> _logger = Substitute.For<ILogger<RefreshTokenCleaner>>();

    [Fact]
    public async Task RemovesExpiredAndRevokedTokens()
    {
        ApiDbContext db = _contextFactory.CreateContext();
        ApiUser user = DbContextUtils.AddApiUser(db);

        var expiredToken = new RefreshToken
        {
            Token = Guid.NewGuid().ToString(),
            UserId = user.Id,
            ExpiresAt = _dateTimeWrapper.UtcNow.AddSeconds(-1)
        };

        var revokedToken = new RefreshToken
        {
            Token = Guid.NewGuid().ToString(),
            UserId = user.Id,
            ExpiresAt = _dateTimeWrapper.UtcNow.AddDays(1),
            RevokedAt = _dateTimeWrapper.UtcNow.AddSeconds(-1)
        };

        var revokedAndExpiredToken = new RefreshToken
        {
            Token = Guid.NewGuid().ToString(),
            UserId = user.Id,
            ExpiresAt = expiredToken.ExpiresAt,
            RevokedAt = revokedToken.RevokedAt
        };

        var validToken = new RefreshToken
        {
            Token = Guid.NewGuid().ToString(),
            UserId = user.Id,
            ExpiresAt = _dateTimeWrapper.UtcNow.AddDays(1)
        };

        await db.AddRangeAsync([
            expiredToken,
            revokedToken,
            revokedAndExpiredToken,
            validToken
        ]);

        await db.SaveChangesAsync();

        var cleaner = new RefreshTokenCleaner(_dateTimeWrapper, db, _logger);
        await cleaner.ExecuteAsync(CancellationToken.None);

        List<RefreshToken> remainingRefreshTokens = await db.RefreshTokens.ToListAsync();
        remainingRefreshTokens.Should().ContainSingle(t => t.Token == validToken.Token);
    }
}
