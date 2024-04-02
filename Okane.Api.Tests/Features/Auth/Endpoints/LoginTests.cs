using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Mappers;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Shared.Wrappers;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.Mocks.Wrappers;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class LoginTests : DatabaseTest, IAsyncLifetime
{
    private readonly WebApplicationFactory<IApiMarker> _apiFactory;
    private readonly HttpClient _client;
    private readonly Guid _guid = new();

    // The current time needs to be in the future for JWT token generation to work.
    private readonly DateTime _now = DateTime.UtcNow.AddHours(1);

    public LoginTests(PostgresApiFactory apiFactory) : base(apiFactory)
    {
        _apiFactory = apiFactory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<IGuidWrapper>();
                services.AddSingleton<IGuidWrapper>(_ => new TestingGuidWrapper([_guid]));

                services.RemoveAll<IDateTimeWrapper>();
                services.AddSingleton<IDateTimeWrapper>(_ => new TestingDateTimeWrapper { UtcNow = _now });
            });
        });

        _client = _apiFactory.CreateClient();
    }

    public new async Task InitializeAsync()
    {
        await _client.RegisterTestUserAsync();
    }

    [Fact]
    public async Task LogsInAnExistingUser()
    {
        using IServiceScope scope = _apiFactory.Services.CreateScope();

        ApiUser testUser = await Db.FindTestUserAsync();
        var request = new Login.Request(testUser.Email!, TestUser.Password);
        HttpResponseMessage response = await _client.PostAsJsonAsync("/auth/login", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // User.
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<AuthenticateResponse>>();
        AuthenticateResponse authResponse = body!.Items[0];
        authResponse.User.Should().BeEquivalentTo(testUser.ToUserResponse());

        // JWT token.
        JwtSecurityToken jwtToken = new JwtSecurityTokenHandler().ReadJwtToken(authResponse.JwtToken);
        var jwtOptions = scope.ServiceProvider.GetRequiredService<IOptions<JwtSettings>>();
        DateTime expectedExpiryTime = _now.AddMinutes(jwtOptions.Value.MinutesToExpiration);
        var expectedExpiryClaim = new DateTimeOffset(expectedExpiryTime).ToUnixTimeSeconds();

        jwtToken.Claims.Should()
            .ContainSingle(c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == testUser.Id)
            .And
            .ContainSingle(c => c.Type == JwtRegisteredClaimNames.Jti && c.Value == _guid.ToString())
            .And
            .ContainSingle(c => c.Type == JwtRegisteredClaimNames.Exp && c.Value == expectedExpiryClaim.ToString());

        // Refresh token in cookie.
        var tokenService = scope.ServiceProvider.GetRequiredService<ITokenService>();
        RefreshToken expectedRefreshToken = await tokenService.GenerateRefreshTokenAsync(false);
        RefreshToken? createdRefreshToken = await Db.RefreshTokens.SingleOrDefaultAsync(
            t => t.Token == expectedRefreshToken.Token && t.UserId == testUser.Id
        );
        createdRefreshToken.Should().NotBeNull();

        var expectedCookie = CookieUtils.CreateCookieHeader(
            CookieNames.RefreshToken,
            expectedRefreshToken.Token,
            new CookieOptions
            {
                HttpOnly = true,
                Expires = _now.AddDays(jwtOptions.Value.RefreshTokenTtlDays)
            }
        );

        response.Headers.GetValues(HeaderNames.SetCookie).Should().ContainSingle(
            h => h == expectedCookie
        );
    }

    [Fact]
    public async Task ReturnsAnError_WhenUserDoesNotExist()
    {
        var request = new Login.Request("non-existent-user@gmail.com", TestUser.Password);
        HttpResponseMessage response = await _client.PostAsJsonAsync("/auth/login", request);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ReturnsAnError_WhenPasswordIsInvalid()
    {
        var request = new Login.Request(TestUser.Email!, "invalidPassword");
        HttpResponseMessage response = await _client.PostAsJsonAsync("/auth/login", request);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
