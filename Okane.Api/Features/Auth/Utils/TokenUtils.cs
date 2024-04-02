using System.Text;
using Microsoft.IdentityModel.Tokens;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Shared.Wrappers;

namespace Okane.Api.Features.Auth.Utils;

public static class TokenUtils
{
    /// <summary>
    /// Convert a string JWT issuer signing key to a SymmetricSecurityKey.
    /// </summary>
    /// <param name="signingKey">String signing key from settings.</param>
    /// <returns>Signing key converted to SymmetricSecurityKey.</returns>
    public static SymmetricSecurityKey GetIssuerSigningKey(string signingKey)
        => new(Encoding.UTF8.GetBytes(signingKey));

    /// <summary>
    /// Get refresh token from cookie.
    /// </summary>
    /// <param name="request"></param>
    /// <returns>Refresh token.</returns>
    public static string? GetRefreshTokenFromCookie(HttpRequest request)
    {
        request.Cookies.TryGetValue(CookieNames.RefreshToken, out string? refreshToken);
        return refreshToken;
    }

    /// <summary>
    /// Set refresh token on response cookie.
    /// </summary>
    /// <param name="dateTime"></param>
    /// <param name="jwtSettings"></param>
    /// <param name="response"></param>
    /// <param name="refreshToken"></param>
    public static void SetRefreshTokenCookie(
        IDateTimeWrapper dateTime,
        JwtSettings jwtSettings,
        HttpResponse response,
        RefreshToken refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = dateTime.UtcNow.AddDays(jwtSettings.RefreshTokenTtlDays)
        };
        
        response.Cookies.Append(
            CookieNames.RefreshToken, 
            refreshToken.Token,
            cookieOptions
        );
    }
}
