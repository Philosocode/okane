using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Features.Auth.Extensions;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class RotateRefreshTokenTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly PostgresApiFactory _apiFactory = apiFactory;

    private async Task<HttpResponseMessage> MakeRequestAsync(HttpClient client)
    {
        return await client.PostAsync("/auth/refresh-token", null);
    }

    [Fact]
    public async Task ReturnsNewTokensAndRevokesTheOldRefreshToken()
    {
        HttpClient client = _apiFactory.CreateClient();
        AuthenticateResponse loginResponse = await client.RegisterAndLogInTestUserAsync();
        RefreshToken oldRefreshToken = await Db.RefreshTokens
            .SingleAsync(t => t.UserId == loginResponse.User.Id);

        HttpResponseMessage response = await MakeRequestAsync(client);
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        IDictionary<string, string> responseCookies = CookieUtils.GetCookieHeaderDictionary(
            response.Headers,
            CookieNames.RefreshToken
        );
        var newRefreshToken = responseCookies[CookieNames.RefreshToken];
        newRefreshToken.Should().NotBe(oldRefreshToken.Token);

        var tokenResponse = await response.Content.ReadFromJsonAsync<ApiResponse<AuthenticateResponse>>();
        tokenResponse?.Items.Should()
            .NotBeNull()
            .And.ContainSingle();

        AuthenticateResponse responseData = tokenResponse!.Items[0];
        responseData.JwtToken.Should().NotBe(loginResponse.JwtToken);
        responseData.User.Should().BeEquivalentTo(loginResponse.User);

        var oldRefreshTokenWasRevoked = await Db.RefreshTokens.Where(
            t => t.Token == oldRefreshToken.Token
        ).AllAsync(t => t.RevokedAt != null);

        oldRefreshTokenWasRevoked.Should().BeTrue();
    }

    private async Task AssertInvalidRefreshTokenErrorAsync(HttpClient client)
    {
        HttpResponseMessage response = await MakeRequestAsync(client);
        response.Should().HaveStatusCode(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        problemDetails.Should().BeEquivalentTo(new ProblemDetails
        {
            Detail = "Invalid refresh token.",
            Status = StatusCodes.Status400BadRequest,
            Title = "Bad Request",
            Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1"
        });
    }

    [Fact]
    public async Task ReturnsAnError_WhenRefreshTokenIsMissing()
    {
        HttpClient client = _apiFactory.CreateClient();
        AuthenticateResponse authResponse = await client.RegisterAndLogInTestUserAsync();

        client = _apiFactory.CreateClient();
        client.SetBearerToken(authResponse.JwtToken);

        await AssertInvalidRefreshTokenErrorAsync(client);
    }

    [Fact]
    public async Task ReturnsAnError_WhenRefreshTokenIsInvalid()
    {
        HttpClient client = _apiFactory.CreateClient();
        AuthenticateResponse authResponse = await client.RegisterAndLogInTestUserAsync();

        RefreshToken refreshToken = await Db.RefreshTokens.SingleAsync(
            t => t.UserId == authResponse.User.Id
        );
        refreshToken.Token = Guid.NewGuid().ToString();
        await Db.SaveChangesAsync();

        await AssertInvalidRefreshTokenErrorAsync(client);
    }

    [Fact]
    public async Task ReturnsAnError_WhenRefreshTokenIsExpired()
    {
        HttpClient client = _apiFactory.CreateClient();
        AuthenticateResponse authResponse = await client.RegisterAndLogInTestUserAsync();

        RefreshToken refreshToken = await Db.RefreshTokens.SingleAsync(
            t => t.UserId == authResponse.User.Id
        );
        refreshToken.ExpiresAt = DateTime.UtcNow;
        await Db.SaveChangesAsync();

        await AssertInvalidRefreshTokenErrorAsync(client);
    }

    [Fact]
    public async Task ReturnsAnErrorAndRevokesAllRefreshTokens_WhenRefreshTokenIsAlreadyRevoked()
    {
        HttpClient client = _apiFactory.CreateClient();
        AuthenticateResponse authResponse = await client.RegisterAndLogInTestUserAsync();

        RefreshToken refreshToken = await Db.RefreshTokens.SingleAsync(
            t => t.UserId == authResponse.User.Id
        );
        refreshToken.RevokedAt = DateTime.UtcNow.AddDays(-1);

        // When a user attempts to rotate an already-revoked token, all the following non-revoked
        // refresh tokens should get revoked.
        var refreshTokensPerUser = 3;
        for (var i = 0; i < refreshTokensPerUser; i++)
        {
            Db.Add(RefreshTokenStubFactory.Create(authResponse.User.Id));
        }

        // We'll also register another user and check that their tokens are NOT affected.
        var otherUserEmail = "other@okane.com";
        await UserUtils.RegisterUserAsync(client, new Register.Request(
            "Other User",
            otherUserEmail,
            TestUser.Password
        ));

        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);

        for (var i = 0; i < refreshTokensPerUser; i++)
        {
            Db.Add(RefreshTokenStubFactory.Create(otherUser.Id));
        }

        await Db.SaveChangesAsync();
        await AssertInvalidRefreshTokenErrorAsync(client);

        // If we don't do this, the updates from ExecuteUpdateAsync won't be available; stale data
        // will be returned instead.
        Db.ChangeTracker.Clear();

        List<RefreshToken> authUserRefreshTokens = await Db.RefreshTokens.Where(
            t => t.UserId == authResponse.User.Id
        ).ToListAsync();

        authUserRefreshTokens.Should()
            .HaveCount(refreshTokensPerUser + 1)
            .And.AllSatisfy(t => t.RevokedAt.Should().NotBeNull());

        List<RefreshToken> otherUserRefreshTokens = await Db.RefreshTokens.Where(
            t => t.UserId == otherUser.Id
        ).ToListAsync();

        otherUserRefreshTokens.Should()
            .HaveCount(refreshTokensPerUser)
            .And.AllSatisfy(t => t.RevokedAt.Should().BeNull());
    }
}
