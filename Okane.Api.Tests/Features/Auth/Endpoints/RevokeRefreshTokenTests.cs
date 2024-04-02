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
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class RevokeRefreshTokenTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly PostgresApiFactory _apiFactory = apiFactory;

    [Fact]
    public async Task ReturnsAnError_WhenNoRefreshTokenIsProvided()
    {
        HttpClient client = _apiFactory.CreateClient();
        AuthenticateResponse loginResponse = await client.RegisterAndLogInTestUserAsync();

        client = _apiFactory.CreateClient();
        client.SetBearerToken(loginResponse.JwtToken);

        HttpResponseMessage response = await client.PostAsync("/auth/revoke-token", null);
        response.Should().HaveStatusCode(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problemDetails.Should().NotBeNull();
        problemDetails?.Status.Should().Be(StatusCodes.Status400BadRequest);
        problemDetails?.Errors.Should().HaveCount(1);
        problemDetails?.Errors.Should().Contain(
            entry => entry.Key == "refreshToken"
                     && entry.Value[0] == "A valid refresh token must be provided in request body or cookie."
        );
    }

    [Fact]
    public async Task RevokesRefreshToken_WhenPresentInCookie()
    {
        HttpClient client = _apiFactory.CreateClient();

        await client.RegisterTestUserAsync();
        HttpResponseMessage loginResponse = await client.LogInTestUserAsync();
        var loginData = await loginResponse.Content.ReadFromJsonAsync<ApiResponse<AuthenticateResponse>>();
        client.SetBearerToken(loginData!.Items[0].JwtToken);

        HttpResponseMessage response = await client.PostAsync("/auth/revoke-token", null);
        response.Should().HaveStatusCode(HttpStatusCode.NoContent);

        IDictionary<string, string> cookieHeaders = CookieUtils.GetCookieHeaderDictionary(
            loginResponse.Headers,
            CookieNames.RefreshToken
        );

        RefreshToken? revokedToken = await Db.RefreshTokens.SingleOrDefaultAsync(
            t => t.Token == cookieHeaders[CookieNames.RefreshToken]
        );
        revokedToken.Should().NotBeNull();
        revokedToken?.RevokedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task RevokesRefreshToken_WhenPassedInRequestBody()
    {
        HttpClient client = _apiFactory.CreateClient();
        await client.RegisterTestUserAsync();
        HttpResponseMessage loginResponse = await client.LogInTestUserAsync();
        var loginData = await loginResponse.Content.ReadFromJsonAsync<ApiResponse<AuthenticateResponse>>();

        IDictionary<string, string> cookieHeaders = CookieUtils.GetCookieHeaderDictionary(
            loginResponse.Headers,
            CookieNames.RefreshToken
        );
        var refreshToken = cookieHeaders[CookieNames.RefreshToken];

        // Use a new client so the cookie refresh token isn't used.
        client = _apiFactory.CreateClient();
        client.SetBearerToken(loginData!.Items[0].JwtToken);

        HttpResponseMessage response = await client.PostAsJsonAsync(
            "/auth/revoke-token",
            new RevokeRefreshToken.Request(refreshToken)
        );
        response.Should().HaveStatusCode(HttpStatusCode.NoContent);

        RefreshToken? revokedToken = await Db.RefreshTokens.SingleOrDefaultAsync(
            t => t.Token == refreshToken
        );
        revokedToken.Should().NotBeNull();
        revokedToken?.RevokedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task DoesNothing_WhenRefreshTokenIsAlreadyRevoked()
    {
        HttpClient client = _apiFactory.CreateClient();
        AuthenticateResponse loginResponse = await client.RegisterAndLogInTestUserAsync();

        RefreshToken refreshToken = await Db.RefreshTokens.SingleAsync(
            t => t.UserId == loginResponse.User.Id
        );
        DateTime firstRevokedAt = DateTime.UtcNow.AddDays(-1);
        refreshToken.RevokedAt = firstRevokedAt;
        await Db.SaveChangesAsync();

        HttpResponseMessage response = await client.PostAsync("/auth/revoke-token", null);
        response.Should().HaveStatusCode(HttpStatusCode.NoContent);

        RefreshToken revokedToken = await Db.RefreshTokens.SingleAsync(
            t => t.UserId == loginResponse.User.Id
        );
        revokedToken.RevokedAt.Should().Be(firstRevokedAt);
    }
}
