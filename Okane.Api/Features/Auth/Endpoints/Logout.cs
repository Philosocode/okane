using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Features.Auth.Utils;
using Okane.Api.Infrastructure.Endpoints;

namespace Okane.Api.Features.Auth.Endpoints;

public class Logout : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPost("/logout", HandleAsync)
            .WithName(AuthEndpointNames.Logout)
            .WithSummary("Log out a user.");
    }

    private static async Task<NoContent> HandleAsync(
        ClaimsPrincipal claimsPrincipal,
        HttpContext context,
        ITokenService tokenService,
        CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();
        var refreshToken = TokenUtils.GetRefreshTokenFromCookie(context.Request);
        if (refreshToken is not null)
        {
            await tokenService.RevokeRefreshTokenAsync(refreshToken, userId, cancellationToken);
        }

        await context.SignOutAsync();

        context.Response.Cookies.Delete(CookieNames.RefreshToken);

        return TypedResults.NoContent();
    }
}
