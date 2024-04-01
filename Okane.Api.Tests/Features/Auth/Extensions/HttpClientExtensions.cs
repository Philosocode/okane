namespace Okane.Api.Tests.Features.Auth.Extensions;

public static class HttpClientExtensions
{
    public static void SetBearerToken(this HttpClient client, string jwtToken)
    {
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {jwtToken}");
    }
}
