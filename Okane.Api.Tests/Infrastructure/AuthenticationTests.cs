using System.Net;
using FluentAssertions;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Tests.Features.Auth.Extensions;
using Okane.Api.Tests.Testing.Integration;

namespace Okane.Api.Tests.Infrastructure;

public class AuthenticationTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly PostgresApiFactory _apiFactory = apiFactory;

    [Fact]
    public async Task CanAuthenticateWithBearerToken()
    {
        HttpClient client = _apiFactory.CreateClient();
        AuthenticateResponse authResponse = await client.RegisterAndLogInTestUserAsync();

        client = _apiFactory.CreateClient();
        client.SetBearerToken(authResponse.JwtToken);

        HttpResponseMessage response = await client.GetAsync("/auth/self");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
