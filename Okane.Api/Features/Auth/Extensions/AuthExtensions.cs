using System.Security.Claims;

namespace Okane.Api.Features.Auth.Extensions;

public static class AuthExtensions
{
    /// <summary>
    /// Extract the user ID from this ClaimsPrincipal.
    /// </summary>
    /// <param name="principal"></param>
    /// <returns>ID of the ClaimsPrincipal, if present.</returns>
    public static string? GetUserId(this ClaimsPrincipal principal)
    {
        if (principal.Identity is null || !principal.Identity.IsAuthenticated)
        {
            return null;
        }

        var idClaim = principal.Claims.SingleOrDefault(
            claim => claim.Type == ClaimTypes.NameIdentifier
        );

        return idClaim?.Value;
    }
}
