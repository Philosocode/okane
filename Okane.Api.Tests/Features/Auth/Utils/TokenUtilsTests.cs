using System.Text;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using NSubstitute;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Utils;
using Okane.Api.Tests.Testing.Mocks.Wrappers;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Auth.Utils;

public class TokenUtilsTests
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
        var jwtSettings = JwtSettingsStubFactory.Create();
        var httpContext = new DefaultHttpContext();
        var refreshToken = new RefreshToken
        {
            Token = "cool-refresh-token",
            ExpiresAt = default,
            CreatedAt = default
        };

        TokenUtils.SetRefreshTokenCookie(clock, jwtSettings, httpContext.Response, refreshToken);

        IDictionary<string, string> cookieData = CookieUtils.GetCookieHeaderDictionary(
            httpContext.Response.Headers,
            CookieNames.RefreshToken
        );

        cookieData.Should()
            .Contain(CookieNames.RefreshToken, refreshToken.Token)
            .And.ContainKey("httponly")
            .And.ContainKey("expires");

        DateTime expiresAt = DateTime.Parse(cookieData["expires"]);
        DateTime expectedExpiresAt = clock.UtcNow.AddDays(jwtSettings.RefreshTokenTtlDays);
        expiresAt.Should().Be(expectedExpiresAt);
    }
}
