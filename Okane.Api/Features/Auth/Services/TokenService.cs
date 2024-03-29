using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Utils;
using Okane.Api.Infrastructure.Database;

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
    /// <returns>Application-wide unique refresh token.</returns>
    Task<RefreshToken> GenerateRefreshToken();
    
    /// <summary>
    /// Revoke a refresh token belonging to a specific user.
    /// </summary>
    /// <param name="refreshToken"></param>
    /// <param name="userId"></param>
    /// <param name="cancellationToken"></param>
    Task RevokeRefreshToken(string refreshToken, string userId, CancellationToken cancellationToken);
}

public class TokenService(ApiDbContext db, IOptions<JwtSettings> jwtOptions) : ITokenService
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
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            }
        );

        var tokenDescriptor = new SecurityTokenDescriptor()
        {
            Audience = jwtSettings.Audience,
            Issuer = jwtSettings.Issuer,
            Expires = DateTime.UtcNow.AddMinutes(jwtSettings.MinutesToExpiration),
            SigningCredentials = signingCredentials,
            Subject = claimsIdentity,
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);
        
        return tokenHandler.WriteToken(token);
    }

    public async Task<RefreshToken> GenerateRefreshToken()
    {
        var token = "";
        var foundUniqueToken = false;
        while (!foundUniqueToken)
        {
            token = Guid.NewGuid().ToString();

            var isDuplicateToken = await db.RefreshTokens.AnyAsync(t => t.Token == token);
            
            foundUniqueToken = !isDuplicateToken;
        }

        return new RefreshToken
        {
            Token = token,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(jwtOptions.Value.RefreshTokenTtlDays),
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
            tokenToRevoke.RevokedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
