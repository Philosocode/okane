using System.Security.Claims;

namespace Okane.Api.Features.Auth.Extensions;

public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Extract the user ID from this ClaimsPrincipal.
    /// </summary>
    /// <param name="claimsPrincipal"></param>
    /// <returns>ID of the ClaimsPrincipal, if present.</returns>
    public static string GetUserId(this ClaimsPrincipal claimsPrincipal)
    {
        string? userId = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (claimsPrincipal.Identity is null || !claimsPrincipal.Identity.IsAuthenticated || userId is null)
        {
            throw new InvalidOperationException("Invalid UserId");
        }

        return userId;
    }
}
