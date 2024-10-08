using System.Text;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using NSubstitute;
using Okane.Api.Features.Auth.Config;
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
        SymmetricSecurityKey actual = TokenUtils.GetIssuerSigningKey(key);
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
        var dateTimeWrapper = new TestingDateTimeWrapper();
        JwtSettings jwtSettings = JwtSettingsStubFactory.Create();
        var httpContext = new DefaultHttpContext();
        var refreshToken = new RefreshToken
        {
            Token = "cool-refresh-token",
            ExpiresAt = default
        };

        TokenUtils.SetRefreshTokenCookie(dateTimeWrapper, jwtSettings, httpContext.Response, refreshToken);

        IDictionary<string, string> cookieData = CookieUtils.GetCookieHeaderDictionary(
            httpContext.Response.Headers,
            CookieNames.RefreshToken
        );

        cookieData.Should()
            .Contain(CookieNames.RefreshToken, refreshToken.Token)
            .And.ContainKey("httponly")
            .And.ContainKey("expires");

        DateTime expiresAt = DateTime.Parse(cookieData["expires"]);
        DateTime expectedExpiresAt = dateTimeWrapper.UtcNow.AddDays(jwtSettings.RefreshTokenTtlDays);
        expiresAt.ToUniversalTime().Should().Be(expectedExpiresAt);
    }
}
