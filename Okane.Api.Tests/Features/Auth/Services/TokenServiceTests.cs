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
using Okane.Api.Infrastructure.Database;
using Okane.Api.Shared.Wrappers;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.Mocks.Wrappers;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Auth.Services;

public class TokenServiceTests : IDisposable
{
    private readonly IClock _clock = new TestingClock { UtcNow = DateTime.UtcNow };
    private readonly IList<Guid> _guids = [Guid.NewGuid(), Guid.NewGuid()];
    private readonly JwtSettings _jwtSettings = JwtSettingsStubFactory.Create();

    private readonly InMemoryContextFactory _contextFactory = new InMemoryContextFactory();
    private readonly ApiDbContext _db;
    private readonly TokenService _tokenService;

    public TokenServiceTests()
    {
        _db = _contextFactory.CreateContext();
        _tokenService = new TokenService(
            _clock,
            _db,
            new TestingGuidGenerator(_guids),
            new OptionsWrapper<JwtSettings>(_jwtSettings)
        );
    }

    public void Dispose()
    {
        _db.Dispose();
        _contextFactory.Dispose();
    }

    private RefreshToken InsertRefreshToken(string token, string userId)
    {
        var refreshToken = RefreshTokenStubFactory.Create(userId);
        refreshToken.Token = token;
        _db.Add(refreshToken);

        return refreshToken;
    }
    
    [Fact]
    public void GenerateJwtToken_ReturnsANewJwtToken()
    {
        var userId = Guid.NewGuid().ToString();
        var key = TokenUtils.GetIssuerSigningKey(_jwtSettings.IssuerSigningKey);
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

        var tokenDescriptor = new SecurityTokenDescriptor()
        {
            Audience = _jwtSettings.Audience,
            Issuer = _jwtSettings.Issuer,
            Expires = _clock.UtcNow.AddMinutes(_jwtSettings.MinutesToExpiration),
            SigningCredentials = signingCredentials,
            Subject = claimsIdentity,
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

        string expected = tokenHandler.WriteToken(token);
        string actual = _tokenService.GenerateJwtToken(userId);

        actual.Should().Be(expected);
    }

    [Fact]
    public async Task GenerateRefreshToken_ReturnsANewUniqueRefreshToken()
    {
        var apiUser = DbTestingUtils.InsertApiUser(_db);
        InsertRefreshToken(_guids[0].ToString(), apiUser.Id);
        await _db.SaveChangesAsync();

        var newRefreshToken = await _tokenService.GenerateRefreshToken(generateUniqueToken: true);
        newRefreshToken.Token.Should().Be(_guids[1].ToString());
    }

    [Fact]
    public async Task GenerateRefreshToken_ReturnsADuplicateRefreshToken()
    {
        // The GUID generator has been seeded with two GUIDs, so we'll need to generate 3 GUIDs
        // to force a duplicate.
        var token1 = await _tokenService.GenerateRefreshToken(generateUniqueToken: false);
        await _tokenService.GenerateRefreshToken(generateUniqueToken: false);
        var token2 = await _tokenService.GenerateRefreshToken(generateUniqueToken: false);

        token1.Token.Should().Be(token2.Token);
    }
    
    [Fact]
    public async Task RevokeRefreshToken_UpdatesTheRevokedAtField()
    {
        var apiUser = DbTestingUtils.InsertApiUser(_db);
        InsertRefreshToken(_guids[0].ToString(), apiUser.Id);
        var refreshTokenToRevoke = InsertRefreshToken(_guids[1].ToString(), apiUser.Id);
        
        await _db.SaveChangesAsync();

        await _tokenService.RevokeRefreshToken(refreshTokenToRevoke.Token, apiUser.Id, CancellationToken.None);

        var revokedToken = await _db.RefreshTokens.SingleOrDefaultAsync(
            t => t.Token == refreshTokenToRevoke.Token
        );
        revokedToken?.RevokedAt.Should().NotBeNull();
        revokedToken?.RevokedAt.Should().Be(_clock.UtcNow);
    }
    
    [Fact]
    public async Task RevokeRefreshToken_DoesNothing_WhenTokenNotFound()
    {
        var apiUser = DbTestingUtils.InsertApiUser(_db);
        InsertRefreshToken(_guids[0].ToString(), apiUser.Id);
        await _db.SaveChangesAsync();

        await _tokenService.RevokeRefreshToken("non-existent-token", apiUser.Id, CancellationToken.None);

        bool hasRevokedToken = await _db.RefreshTokens.AnyAsync(t => t.RevokedAt != null);
        hasRevokedToken.Should().BeFalse();
    }
    
    [Fact]
    public async Task RevokeRefreshToken_DoesNothing_WhenTokenBelongsToDifferentUser()
    {
        var apiUser = DbTestingUtils.InsertApiUser(_db);
        var refreshToken = InsertRefreshToken(_guids[0].ToString(), apiUser.Id);
        await _db.SaveChangesAsync();

        await _tokenService.RevokeRefreshToken(refreshToken.Token, "other-user", CancellationToken.None);

        bool hasRevokedToken = await _db.RefreshTokens.AnyAsync(t => t.RevokedAt != null);
        hasRevokedToken.Should().BeFalse();
    }
    
    [Fact]
    public async Task RevokeRefreshToken_DoesNothing_WhenTokenAlreadyRevoked()
    {
        var apiUser = DbTestingUtils.InsertApiUser(_db);
        var revokedAt = new DateTime(2024, 1, 1);
        var alreadyRevokedRefreshToken = new RefreshToken
        {
            Token = _guids[0].ToString(),
            CreatedAt = default,
            ExpiresAt = default,
            RevokedAt = revokedAt,
            UserId = apiUser.Id,
        };
        _db.Add(alreadyRevokedRefreshToken);
        
        await _db.SaveChangesAsync();

        await _tokenService.RevokeRefreshToken(
            alreadyRevokedRefreshToken.Token,
            apiUser.Id,
            CancellationToken.None
        );

        var refreshToken = await _db.RefreshTokens.SingleOrDefaultAsync(
            t => t.Token == alreadyRevokedRefreshToken.Token
        );
        refreshToken?.RevokedAt.Should().Be(alreadyRevokedRefreshToken.RevokedAt);
    }
}
