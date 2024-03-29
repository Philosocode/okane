using Microsoft.AspNetCore.Http;

namespace Okane.Api.Tests.Tests.Extensions;

public static class HttpContextExtensions
{
    /// <summary>Extracts the values from a single header cookie.</summary>
    /// <param name="headers"></param>
    /// <param name="cookieKey">The key for identifying the cookie.</param>
    /// <returns>The cookie values in a dictionary.</returns>
    /// <see href="https://stackoverflow.com/a/77150192" />
    /// 
    public static IDictionary<string, string?> GetCookieData(this IHeaderDictionary headers, string cookieKey)
    {
        var cookieDictionary = new Dictionary<string, string?>();
        
        string headerKey = $"{cookieKey}=";
        string[]? cookieParts = headers.Values
            .SelectMany(h => h)
            .Where(header => header != null && header.StartsWith(headerKey))
            .Select(header => header?.Substring(headerKey.Length).Split("; "))
            .FirstOrDefault();

        if (cookieParts is null) return cookieDictionary;

        foreach (var part in cookieParts)
        {
            var keyValue = part.Split("=");
            if (keyValue.Length >= 2)
            {
                cookieDictionary[keyValue[0]] = keyValue[1];
            }
            else
            {
                cookieDictionary[keyValue[0]] = string.Empty;
            }
        }

        return cookieDictionary;
    }
}
