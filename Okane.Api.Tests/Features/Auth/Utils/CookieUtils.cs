using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;
using Microsoft.Net.Http.Headers;

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

    public static IDictionary<string, string> GetCookieHeaderDictionary(IHeaderDictionary headers, string key)
    {
        headers.TryGetValue(HeaderNames.SetCookie, out var cookieHeaders);
        return GetCookieHeaderDictionary(cookieHeaders, key);
    }

    public static IDictionary<string, string> GetCookieHeaderDictionary(
        HttpResponseHeaders headers,
        string key)
    {
        headers.TryGetValues(HeaderNames.SetCookie, out var cookieHeaders);
        return GetCookieHeaderDictionary(cookieHeaders ?? [], key);
    }
    
    /// <summary>Extracts the values from a single cookie header.</summary>
    /// <param name="cookieHeaders"></param>
    /// <param name="key">Cookie name.</param>
    /// <returns>Dictionary containing the cookie keys and values.</returns>
    /// <see href="https://stackoverflow.com/a/77150192" />
    /// 
    private static IDictionary<string, string> GetCookieHeaderDictionary(
        IEnumerable<string> cookieHeaders,
        string key) 
    {
        var cookieDictionary = new Dictionary<string, string>();

        string? cookieHeader = cookieHeaders.SingleOrDefault(h => h.StartsWith($"{key}="));
        if (cookieHeader is null) return cookieDictionary;

        foreach (string part in cookieHeader.Split("; "))
        {
            string[] keyValue = part.Split("=");
            
            // e.g. expires=Mon, 15 Apr 2024 17:44:21 GMT
            if (keyValue.Length >= 2)
            {
                cookieDictionary[keyValue[0]] = keyValue[1];
            }
            // e.g. httponly
            else
            {
                cookieDictionary[keyValue[0]] = string.Empty;
            }
        }

        return cookieDictionary;

    }
}
