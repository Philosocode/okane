using System.Text;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using NSubstitute;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Utils;
using Okane.Api.Tests.Tests.Extensions;
using Okane.Api.Tests.Tests.Mocks.Wrappers;
using Xunit.Abstractions;

namespace Okane.Api.Tests.Features.Auth.Utils;

public class TokenUtilsTests(ITestOutputHelper testOutputHelper)
{
    [Fact]
    public void GetIssuerSigningKey_ReturnsAnEncodedSigningKey()
    {
        var key = "random-signing-key";
        var actual = TokenUtils.GetIssuerSigningKey(key);
        var expected = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        
        actual.Should().BeEquivalentTo(expected);
    }

    [Fact]
    public void GetRefreshTokenFromCookie_ReturnsACookieRefreshToken()
    {
        var refreshToken = "cool-refresh-token";
        var httpContext = Substitute.For<HttpContext>();
        httpContext.Request.Cookies
            .TryGetValue(CookieNames.RefreshToken, out Arg.Any<string?>())
            .Returns(x =>
            {
                x[1] = refreshToken;
                return true;
            });


        var actual = TokenUtils.GetRefreshTokenFromCookie(httpContext.Request);
        actual.Should().Be(refreshToken);
    }

    [Fact]
    public void SetRefreshTokenCookie_AddsARefreshTokenCookie()
    {
        var clock = new TestingClock();
        var jwtSettings = new JwtSettings { RefreshTokenTtlDays = 2 };
        var httpContext = new DefaultHttpContext();
        var refreshToken = new RefreshToken
        {
            Token = "cool-refresh-token",
            ExpiresAt = default,
            CreatedAt = default
        };

        TokenUtils.SetRefreshTokenCookie(clock, jwtSettings, httpContext.Response, refreshToken);
        
        IDictionary<string, string?> cookieData = httpContext.Response.Headers.GetCookieData(CookieNames.RefreshToken);
        
        cookieData.Should().ContainKey(refreshToken.Token);
        cookieData[refreshToken.Token].Should().BeNullOrEmpty();

        cookieData.Should().ContainKey("expires");
        DateTime expiresAt = DateTime.Parse(cookieData["expires"] ?? "");
        DateTime expectedExpiresAt = clock.UtcNow.AddDays(jwtSettings.RefreshTokenTtlDays);
        expiresAt.Should().Be(expectedExpiresAt);
        
        cookieData.Should().ContainKey("httponly");
    }
}
