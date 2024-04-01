using Microsoft.AspNetCore.Http;

namespace Okane.Api.Tests.Features.Auth.Utils;

public static class CookieUtils
{
    public static string CreateCookieHeader(string key, string value, CookieOptions options)
    {
        var cookieHeader = options.CreateCookieHeader(key, value);
        return cookieHeader.ToString();
    }

    public static string CreateDeletedCookieHeader(string key)
        => CreateCookieHeader(key, "", new CookieOptions { Expires = DateTime.UnixEpoch });
}
