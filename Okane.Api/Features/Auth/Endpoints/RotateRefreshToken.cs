using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
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
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Shared.Exceptions;
using Okane.Api.Shared.Wrappers.Clock;

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

    private static async Task<Results<Ok<ApiResponse<AuthenticateResponse>>, BadRequest<ProblemDetails>>>
        Handle(
            IClock clock,
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

        var invalidRefreshTokenResponse = TypedResults.BadRequest(
            new ApiException("Invalid refresh token.").ToProblemDetails()
        );

        if (refreshTokenToRotate is null)
        {
            return invalidRefreshTokenResponse;
        }

        if (refreshTokenToRotate.IsRevoked)
        {
            // Someone's trying to authenticate with a revoked token. As a security measure,
            // revoke all their tokens.
            logger.LogWarning(
                "Revoked refresh token for user {UserId} received when rotating refresh token",
                refreshTokenToRotate.UserId
            );

            await db.RefreshTokens
                .Where(t => t.UserId == refreshTokenToRotate.UserId)
                .ExecuteUpdateAsync(
                    s => s.SetProperty(
                        t => t.RevokedAt, DateTime.UtcNow
                ));

            return invalidRefreshTokenResponse;
        }
        
        if (refreshTokenToRotate.IsExpired)
        {
            return invalidRefreshTokenResponse;
        }

        refreshTokenToRotate.RevokedAt = DateTime.UtcNow;
        
        RefreshToken newRefreshToken = await tokenService.GenerateRefreshToken(generateUniqueToken: true);
        newRefreshToken.UserId = refreshTokenToRotate.UserId;

        db.Add(newRefreshToken);
        
        await db.SaveChangesAsync();

        logger.LogInformation(
            "Generated refresh token {NewRefreshToken} for user {UserId}. Old revoked token: {OldRefreshToken}",
            newRefreshToken.Token,
            refreshTokenToRotate.UserId,
            refreshTokenToRotate.Token
        );
        
        TokenUtils.SetRefreshTokenCookie(clock, jwtSettings.Value, context.Response, newRefreshToken);

        string newJwtToken = tokenService.GenerateJwtToken(refreshTokenToRotate.UserId);
        
        var response = new AuthenticateResponse
        {
            User = refreshTokenToRotate.User.ToUserResponse(),
            JwtToken = newJwtToken,
            RefreshToken = newRefreshToken
        };
        
        return TypedResults.Ok(new ApiResponse<AuthenticateResponse>(response));
    }
}
