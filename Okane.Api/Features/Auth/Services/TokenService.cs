using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Utils;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Shared.Wrappers;

namespace Okane.Api.Features.Auth.Services;

/// <summary>
/// Service for generating JWT and refresh tokens.
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Generate a JWT token.
    /// </summary>
    /// <param name="userId"></param>
    /// <returns>Generated JWT token.</returns>
    string GenerateJwtToken(string userId);
    
    /// <summary>
    /// Generate a unique refresh token.
    /// </summary>
    /// <param name="generateUniqueToken"></param>
    /// <returns>Application-wide unique refresh token.</returns>
    Task<RefreshToken> GenerateRefreshToken(bool generateUniqueToken);
    
    /// <summary>
    /// Revoke a refresh token belonging to a specific user.
    /// </summary>
    /// <param name="refreshToken"></param>
    /// <param name="userId"></param>
    /// <param name="cancellationToken"></param>
    Task RevokeRefreshToken(string refreshToken, string userId, CancellationToken cancellationToken);
}

public class TokenService(
    IClock clock,
    ApiDbContext db,
    IGuidGenerator guidGenerator,
    IOptions<JwtSettings> jwtOptions) : ITokenService
{
    public string GenerateJwtToken(string userId)
    {
        var jwtSettings = jwtOptions.Value;
        
        var key = TokenUtils.GetIssuerSigningKey(jwtSettings. IssuerSigningKey);
        var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
        var claimsIdentity = new ClaimsIdentity(
            new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim(JwtRegisteredClaimNames.Jti, guidGenerator.NewGuid().ToString())
            }
        );

        var tokenDescriptor = new SecurityTokenDescriptor()
        {
            Audience = jwtSettings.Audience,
            Issuer = jwtSettings.Issuer,
            Expires = clock.UtcNow.AddMinutes(jwtSettings.MinutesToExpiration),
            SigningCredentials = signingCredentials,
            Subject = claimsIdentity,
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);
        
        return tokenHandler.WriteToken(token);
    }

    public async Task<RefreshToken> GenerateRefreshToken(bool generateUniqueToken = true)
    {
        var token = "";
        var foundUniqueToken = false;
        do
        {
            token = guidGenerator.NewGuid().ToString();

            var isDuplicateToken = await db.RefreshTokens.AnyAsync(t => t.Token == token);
            
            foundUniqueToken = !isDuplicateToken;
        } while (generateUniqueToken && !foundUniqueToken);

        return new RefreshToken
        {
            Token = token,
            CreatedAt = clock.UtcNow,
            ExpiresAt = clock.UtcNow.AddDays(jwtOptions.Value.RefreshTokenTtlDays),
        };
    }

    public async Task RevokeRefreshToken(string refreshToken, string userId, CancellationToken cancellationToken)
    {
        var tokenToRevoke = await db.RefreshTokens.
            SingleOrDefaultAsync(
                t => t.Token == refreshToken && t.UserId == userId && t.RevokedAt == null,
                cancellationToken
            );

        if (tokenToRevoke is not null)
        {
            tokenToRevoke.RevokedAt = clock.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
