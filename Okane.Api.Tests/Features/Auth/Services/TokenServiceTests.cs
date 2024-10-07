using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Features.Auth.Utils;
using Okane.Api.Shared.Wrappers;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.Mocks.Wrappers;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Auth.Services;

public class TokenServiceTests : DatabaseTest
{
    private readonly IDateTimeWrapper _dateTimeWrapper = new TestingDateTimeWrapper { UtcNow = DateTime.UtcNow };
    private readonly IList<Guid> _guids = [Guid.NewGuid(), Guid.NewGuid()];
    private readonly JwtSettings _jwtSettings = JwtSettingsStubFactory.Create();
    private readonly TokenService _tokenService;

    public TokenServiceTests(PostgresApiFactory apiFactory) : base(apiFactory)
    {
        _tokenService = new TokenService(
            _dateTimeWrapper,
            Db,
            new TestingGuidWrapper(_guids),
            new OptionsWrapper<JwtSettings>(_jwtSettings)
        );
    }

    private RefreshToken InsertRefreshToken(string token, string userId)
    {
        RefreshToken refreshToken = RefreshTokenStubFactory.Create(userId);
        refreshToken.Token = token;
        Db.Add(refreshToken);

        return refreshToken;
    }

    [Fact]
    public void GenerateJwtToken_ReturnsANewJwtToken()
    {
        var userId = Guid.NewGuid().ToString();
        SymmetricSecurityKey key = TokenUtils.GetIssuerSigningKey(_jwtSettings.IssuerSigningKey);
        var signingCredentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha512Signature
        );
        var claimsIdentity = new ClaimsIdentity(
            new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim(JwtRegisteredClaimNames.Jti, _guids[0].ToString())
            }
        );

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Audience = _jwtSettings.Audience,
            Issuer = _jwtSettings.Issuer,
            Expires = _dateTimeWrapper.UtcNow.AddMinutes(_jwtSettings.MinutesToExpiration),
            SigningCredentials = signingCredentials,
            Subject = claimsIdentity
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

        var expected = tokenHandler.WriteToken(token);
        var actual = _tokenService.GenerateJwtToken(userId);

        actual.Should().Be(expected);
    }

    [Fact]
    public async Task GenerateRefreshTokenAsync_ReturnsANewUniqueRefreshToken()
    {
        var apiUser = DbContextUtils.AddApiUser(Db);
        InsertRefreshToken(_guids[0].ToString(), apiUser.Id);
        await Db.SaveChangesAsync();

        RefreshToken newRefreshToken = await _tokenService.GenerateRefreshTokenAsync(true);
        newRefreshToken.Token.Should().Be(_guids[1].ToString());
    }

    [Fact]
    public async Task GenerateRefreshTokenAsync_ReturnsADuplicateRefreshToken()
    {
        // The GUID generator has been seeded with two GUIDs, so we'll need to generate 3 GUIDs
        // to force a duplicate.
        RefreshToken token1 = await _tokenService.GenerateRefreshTokenAsync(false);
        await _tokenService.GenerateRefreshTokenAsync(false);
        RefreshToken token2 = await _tokenService.GenerateRefreshTokenAsync(false);

        token1.Token.Should().Be(token2.Token);
    }

    [Fact]
    public async Task RevokeRefreshTokenAsync_UpdatesTheRevokedAtField()
    {
        var apiUser = DbContextUtils.AddApiUser(Db);
        InsertRefreshToken(_guids[0].ToString(), apiUser.Id);
        RefreshToken refreshTokenToRevoke = InsertRefreshToken(_guids[1].ToString(), apiUser.Id);

        await Db.SaveChangesAsync();

        await _tokenService.RevokeRefreshTokenAsync(refreshTokenToRevoke.Token, apiUser.Id, CancellationToken.None);

        var revokedToken = await Db.RefreshTokens.SingleOrDefaultAsync(
            t => t.Token == refreshTokenToRevoke.Token
        );
        revokedToken?.RevokedAt.Should().NotBeNull();
        revokedToken?.RevokedAt.Should().Be(_dateTimeWrapper.UtcNow);
    }

    [Fact]
    public async Task RevokeRefreshTokenAsync_DoesNothing_WhenTokenNotFound()
    {
        var apiUser = DbContextUtils.AddApiUser(Db);
        InsertRefreshToken(_guids[0].ToString(), apiUser.Id);
        await Db.SaveChangesAsync();

        await _tokenService.RevokeRefreshTokenAsync("non-existent-token", apiUser.Id, CancellationToken.None);

        var hasRevokedToken = await Db.RefreshTokens.AnyAsync(t => t.RevokedAt != null);
        hasRevokedToken.Should().BeFalse();
    }

    [Fact]
    public async Task RevokeRefreshTokenAsync_DoesNothing_WhenTokenBelongsToDifferentUser()
    {
        var apiUser = DbContextUtils.AddApiUser(Db);
        RefreshToken refreshToken = InsertRefreshToken(_guids[0].ToString(), apiUser.Id);
        await Db.SaveChangesAsync();

        await _tokenService.RevokeRefreshTokenAsync(refreshToken.Token, "other-user", CancellationToken.None);

        var hasRevokedToken = await Db.RefreshTokens.AnyAsync(t => t.RevokedAt != null);
        hasRevokedToken.Should().BeFalse();
    }

    [Fact]
    public async Task RevokeRefreshTokenAsync_DoesNothing_WhenTokenAlreadyRevoked()
    {
        var apiUser = DbContextUtils.AddApiUser(Db);
        var revokedAt = new DateTime(2024, 1, 1).ToUniversalTime();
        var alreadyRevokedRefreshToken = new RefreshToken
        {
            Token = _guids[0].ToString(),
            ExpiresAt = default,
            RevokedAt = revokedAt,
            UserId = apiUser.Id
        };
        Db.Add(alreadyRevokedRefreshToken);

        await Db.SaveChangesAsync();

        await _tokenService.RevokeRefreshTokenAsync(
            alreadyRevokedRefreshToken.Token,
            apiUser.Id,
            CancellationToken.None
        );

        var refreshToken = await Db.RefreshTokens.SingleOrDefaultAsync(
            t => t.Token == alreadyRevokedRefreshToken.Token
        );
        refreshToken?.RevokedAt.Should().Be(alreadyRevokedRefreshToken.RevokedAt);
    }
}
