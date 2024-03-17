using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Okane.Api.Features.Auth.Utils;

public static class AuthUtils
{
    /// <summary>
    /// Convert a string JWT issuer signing key to a SymmetricSecurityKey.
    /// </summary>
    /// <param name="signingKey">String signing key from settings.</param>
    /// <returns>Signing key converted to SymmetricSecurityKey.</returns>
    public static SymmetricSecurityKey GetIssuerSigningKey(string signingKey)
        => new(Encoding.UTF8.GetBytes(signingKey));
}
