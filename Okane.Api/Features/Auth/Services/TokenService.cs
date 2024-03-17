using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
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
    string GenerateJwtToken(string userId);
    Task<RefreshToken> GenerateRefreshToken();
    Task RevokeRefreshToken(string refreshToken, string userId);
}

public class TokenService(ApiDbContext db, JwtSettings jwtSettings) : ITokenService
{
    public string GenerateJwtToken(string userId)
    {
        var key = AuthUtils.GetIssuerSigningKey(jwtSettings.IssuerSigningKey);
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
            var isDuplicateToken = await db.Users.AnyAsync(
                u => u.RefreshTokens.Any(t => t.Token == token)
            );

            foundUniqueToken = !isDuplicateToken;
        }

        return new RefreshToken
        {
            Token = token,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(jwtSettings.MinutesToExpiration),
        };
    }

    public async Task RevokeRefreshToken(string userId, string refreshToken)
    {
        var tokenToRevoke = await db.RefreshTokens.
            Include(t => t.ApiUser.Id).
            SingleOrDefaultAsync(
                t => t.Token == refreshToken && t.ApiUser.Id == userId && !t.IsRevoked
            );

        if (tokenToRevoke is not null)
        {
            tokenToRevoke.RevokedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }
    }
}
