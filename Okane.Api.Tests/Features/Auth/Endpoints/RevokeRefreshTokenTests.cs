using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Features.Auth.Extensions;
using Okane.Api.Tests.Features.Auth.Utils;
using Okane.Api.Tests.Testing.Integration;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class RevokeRefreshTokenTests(TestingApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly TestingApiFactory _apiFactory = apiFactory;
    
    [Fact]
    public async Task ReturnsAnError_WhenNoRefreshTokenIsProvided()
    {
        var client = _apiFactory.CreateClient();
        var loginResponse = await client.RegisterAndLogInTestUserAsync();

        client = _apiFactory.CreateClient();
        client.SetBearerToken(loginResponse.JwtToken);

        var response = await client.PostAsync("/auth/revoke-token", null);
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
        var client = _apiFactory.CreateClient();
        
        await client.RegisterTestUserAsync();
        var loginResponse = await client.LogInTestUserAsync();
        var loginData = await loginResponse.Content.ReadFromJsonAsync<ApiResponse<AuthenticateResponse>>();
        client.SetBearerToken(loginData!.Items[0].JwtToken);

        var response = await client.PostAsync("/auth/revoke-token", null);
        response.Should().HaveStatusCode(HttpStatusCode.NoContent);
        
        var cookieHeaders = CookieUtils.GetCookieHeaderDictionary(
            loginResponse.Headers,
            CookieNames.RefreshToken
        );

        var revokedToken = await Db.RefreshTokens.SingleOrDefaultAsync(
            t => t.Token == cookieHeaders[CookieNames.RefreshToken]
        );
        revokedToken.Should().NotBeNull();
        revokedToken?.RevokedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task RevokesRefreshToken_WhenPassedInRequestBody()
    {
        var client = _apiFactory.CreateClient();
        await client.RegisterTestUserAsync();
        var loginResponse = await client.LogInTestUserAsync();
        var loginData = await loginResponse.Content.ReadFromJsonAsync<ApiResponse<AuthenticateResponse>>();
        
        var cookieHeaders = CookieUtils.GetCookieHeaderDictionary(
            loginResponse.Headers,
            CookieNames.RefreshToken
        );
        var refreshToken = cookieHeaders[CookieNames.RefreshToken];
        
        // Use a new client so the cookie refresh token isn't used.
        client = _apiFactory.CreateClient();
        client.SetBearerToken(loginData!.Items[0].JwtToken);
        
        var response = await client.PostAsJsonAsync(
            "/auth/revoke-token", 
            new RevokeRefreshToken.Request(refreshToken)
        );
        response.Should().HaveStatusCode(HttpStatusCode.NoContent);

        var revokedToken = await Db.RefreshTokens.SingleOrDefaultAsync(
            t => t.Token == refreshToken
        );
        revokedToken.Should().NotBeNull();
        revokedToken?.RevokedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task DoesNothing_WhenRefreshTokenIsAlreadyRevoked()
    {
        var client = _apiFactory.CreateClient();
        var loginResponse = await client.RegisterAndLogInTestUserAsync();

        var refreshToken = await Db.RefreshTokens.SingleAsync(
            t => t.UserId == loginResponse.User.Id
        );
        var firstRevokedAt = DateTime.UtcNow.AddDays(-1);
        refreshToken.RevokedAt = firstRevokedAt;
        await Db.SaveChangesAsync();

        var response = await client.PostAsync("/auth/revoke-token", null);
        response.Should().HaveStatusCode(HttpStatusCode.NoContent);

        var revokedToken = await Db.RefreshTokens.SingleAsync(
            t => t.UserId == loginResponse.User.Id
        );
        revokedToken.RevokedAt.Should().Be(firstRevokedAt);
    }
}
