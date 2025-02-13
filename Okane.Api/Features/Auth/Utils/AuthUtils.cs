using Okane.Api.Shared.Extensions;

namespace Okane.Api.Features.Auth.Utils;

public static class AuthUtils
{
    /// <summary>
    ///     Check that the X-User-Email header matches the email in the body.
    /// </summary>
    /// <param name="context"></param>
    /// <param name="email"></param>
    /// <returns></returns>
    public static bool ValidateXUserEmail(HttpContext context, string email)
    {
        return context.GetXUserEmail().Equals(email, StringComparison.OrdinalIgnoreCase);
    }
}
