using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Features.Auth.Utils;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Exceptions;

namespace Okane.Api.Features.Auth.Endpoints;

public class RevokeRefreshToken : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPost("/revoke-token", Handle)
            .WithName(AuthEndpointNames.RevokeToken)
            .WithSummary("Revoke a refresh token in a cookie or the response body.");
    }

    private record Request(string? RefreshToken);

    private static async Task<Results<NoContent, ValidationErrorResult>> 
        Handle(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            Request request,
            ITokenService tokenService,
            CancellationToken cancellationToken)
    {
        string? refreshTokenToRevoke = request.RefreshToken ?? TokenUtils.GetRefreshTokenFromCookie(context.Request);
        
        if (refreshTokenToRevoke is null)
        {
            return new ValidationErrorResult
            {
                Property = "refreshToken",
                Message = "A valid refresh token must be provided in request body or cookie."
            };
        }

        string userId = claimsPrincipal.GetUserId();
        await tokenService.RevokeRefreshToken(refreshTokenToRevoke, userId, cancellationToken);
        
        return TypedResults.NoContent();
    }
}
