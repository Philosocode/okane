using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Mappings;
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
    Task<AuthenticateResponse> RotateRefreshToken(string oldRefreshToken);
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

    public async Task<AuthenticateResponse> RotateRefreshToken(string oldRefreshToken)
    {
        var tokenToRotate = await db.RefreshTokens.
            Include(t => t.ApiUser).
            SingleOrDefaultAsync(t => t.Token == oldRefreshToken);
        
        if (tokenToRotate is null)
        {
            throw new Exception("Refresh token not found");
        }

        if (tokenToRotate.IsRevoked)
        {
            // Someone's trying to authenticate with a revoked token. As a security measure,
            // revoke all their tokens.
            await db.RefreshTokens.
                Include(t => t.ApiUser).
                Where(t => t.ApiUser.Id == tokenToRotate.ApiUser.Id).
                ExecuteUpdateAsync(
                    s => s.SetProperty(
                        t => t.RevokedAt, DateTime.UtcNow
                    )
                );
            
            throw new Exception("Can't authenticate with revoked refresh token");
        }

        if (!tokenToRotate.IsExpired)
        {
            throw new Exception("Can't authenticate with an expired refresh token.");
        }

        tokenToRotate.RevokedAt = DateTime.UtcNow;
        
        RefreshToken newRefreshToken = await GenerateRefreshToken();
        newRefreshToken.ApiUser = tokenToRotate.ApiUser;
        db.Add(newRefreshToken);

        await db.SaveChangesAsync();
        
        string newJwtToken = GenerateJwtToken(tokenToRotate.ApiUser.Id);
        return new AuthenticateResponse
        {
            JwtToken = newJwtToken,
            RefreshToken = newRefreshToken,
            User = tokenToRotate.ApiUser.ToUserResponse()
        };
    }
}
