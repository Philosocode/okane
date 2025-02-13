using Okane.Api.Shared.Constants;

namespace Okane.Api.Shared.Extensions;

public static class HttpContextExtensions
{
    /// <summary>
    ///     Get HttpContext remote IP address.
    /// </summary>
    public static string GetRemoteIpAddress(this HttpContext context)
    {
        return context.Connection.RemoteIpAddress?.ToString() ?? "";
    }

    /// <summary>
    ///     Get email stored in X-User-Email header.
    /// </summary>
    /// <param name="context"></param>
    public static string GetXUserEmail(this HttpContext context)
    {
        var email = "";
        if (context.Request.Headers.TryGetValue(HttpHeaderNames.XUserEmail, out var headerValue))
        {
            email = headerValue.FirstOrDefault() ?? "";
        }

        return email;
    }
}
