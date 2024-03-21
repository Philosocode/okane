using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Mappers;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Features.Auth.Utils;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponse;

namespace Okane.Api.Features.Auth.Endpoints;

public class RotateRefreshToken : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPost("/refresh-token", Handle)
            .AllowAnonymous()
            .WithName(AuthEndpointNames.RefreshToken)
            .WithSummary("Revoke a refresh token and generate a new refresh and JWT token.");
    }

    private static async Task<Results<Ok<ApiResponse<AuthenticateResponse>>, UnauthorizedHttpResult>>
        Handle(
            HttpContext context,
            ApiDbContext db,
            IOptions<JwtSettings> jwtSettings,
            ILogger<RevokeRefreshToken> logger,
            ITokenService tokenService)
    {
        string? oldRefreshToken = TokenUtils.GetRefreshTokenFromCookie(context.Request);
        RefreshToken? refreshTokenToRotate = await db.RefreshTokens
            .Include(t => t.User)
            .SingleOrDefaultAsync(t => t.Token == oldRefreshToken);

        if (refreshTokenToRotate is null)
        {
            return TypedResults.Unauthorized();
        }

        if (refreshTokenToRotate.IsRevoked)
        {
            // Someone's trying to authenticate with a revoked token. As a security measure,
            // revoke all their tokens.
            logger.LogInformation(
                "Revoked refresh token for user {UserId} received when rotating refresh token",
                refreshTokenToRotate.UserId
            );

            await db.RefreshTokens
                .Where(t => t.UserId == refreshTokenToRotate.UserId)
                .ExecuteUpdateAsync(
                    s => s.SetProperty(
                        t => t.RevokedAt, DateTime.UtcNow
                ));

            return TypedResults.Unauthorized();
        }
        
        if (refreshTokenToRotate.IsExpired)
        {
            return TypedResults.Unauthorized();
        }
        
        RefreshToken newRefreshToken = await tokenService.GenerateRefreshToken();
        string newJwtToken = tokenService.GenerateJwtToken(refreshTokenToRotate.UserId);
        
        refreshTokenToRotate.RevokedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        
        TokenUtils.SetRefreshTokenCookie(jwtSettings.Value, context.Response, newRefreshToken);

        var response = new AuthenticateResponse
        {
            User = refreshTokenToRotate.User.ToUserResponse(),
            JwtToken = newJwtToken,
            RefreshToken = newRefreshToken
        };
        
        return TypedResults.Ok(new ApiResponse<AuthenticateResponse>(response));
    }
}
