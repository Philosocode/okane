using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Tests.Features.Auth.Extensions;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class LogoutTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly PostgresApiFactory _apiFactory = apiFactory;

    [Fact]
    public async Task LogsTheUserOut()
    {
        HttpClient client = _apiFactory.CreateClient();
        AuthenticateResponse loginResponse = await client.RegisterAndLogInTestUserAsync();

        // We'll insert some dummy refresh tokens and confirm they are NOT revoked. Only the
        // refresh token matching the cookie value should be revoked.
        var otherRefreshTokenCount = 4;
        for (var i = 0; i < otherRefreshTokenCount; i++)
        {
            await Db.AddAsync(new RefreshToken
            {
                Token = Guid.NewGuid()
                    .ToString(),
                UserId = loginResponse.User.Id,
                ExpiresAt = default
            });
        }

        await Db.SaveChangesAsync();

        HttpResponseMessage response = await client.PostAsJsonAsync("/auth/logout", loginResponse);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        List<RefreshToken> refreshTokens = await Db.RefreshTokens.ToListAsync();
        refreshTokens.Should()
            .HaveCount(otherRefreshTokenCount + 1)
            .And.ContainSingle(t => t.UserId == loginResponse.User.Id && t.RevokedAt != null);

        var deletedCookieHeader = CookieUtils.CreateDeletedCookieHeader(CookieNames.RefreshToken);
        response.Headers.GetValues(HeaderNames.SetCookie).Should().ContainSingle(h => h == deletedCookieHeader);
    }

    [Fact]
    public async Task DoesNotRevokeRefreshToken_WhenCookieIsNotPassed()
    {
        HttpClient client = _apiFactory.CreateClient();
        AuthenticateResponse loginResponse = await client.RegisterAndLogInTestUserAsync();

        client = _apiFactory.CreateClient();
        client.SetBearerToken(loginResponse.JwtToken);

        HttpResponseMessage response = await client.PostAsJsonAsync("/auth/logout", loginResponse);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        RefreshToken refreshToken = await Db.RefreshTokens.SingleAsync(
            t => t.UserId == loginResponse.User.Id
        );
        refreshToken.IsRevoked.Should().BeFalse();

        var deletedCookieHeader = CookieUtils.CreateDeletedCookieHeader(CookieNames.RefreshToken);
        response.Headers.GetValues(HeaderNames.SetCookie).Should().ContainSingle(h => h == deletedCookieHeader);
    }
}
