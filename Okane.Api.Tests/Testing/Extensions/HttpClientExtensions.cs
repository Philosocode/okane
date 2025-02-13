using System.Diagnostics.CodeAnalysis;
using System.Net.Http.Json;
using System.Text.Json;

namespace Okane.Api.Tests.Testing.Extensions;

public static class HttpClientExtensions
{
    // FROM: https://danieledwards.dev/postasjsonasync-now-with-headers#heading-option-2-extension-methods
    public static Task<HttpResponseMessage> PostAsJsonAsync<TValue>(
        this HttpClient client,
        [StringSyntax(StringSyntaxAttribute.Uri)]
        string? requestUri,
        TValue value,
        IDictionary<string, string> headers, // New parameter.
        JsonSerializerOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        var content = JsonContent.Create(value, null, options);
        foreach (var header in headers)
        {
            // Just in case it was added elsewhere.
            content.Headers.Remove(header.Key);
            content.Headers.Add(header.Key, header.Value);
        }

        return client.PostAsync(requestUri, content, cancellationToken);
    }
}
