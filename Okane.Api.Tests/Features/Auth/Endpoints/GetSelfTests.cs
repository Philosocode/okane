using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Features.Auth.Extensions;
using Okane.Api.Tests.Testing.Integration;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class GetSelfTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    [Fact]
    public async Task ReturnsAuthUserDetails_WhenLoggedIn()
    {
        await _client.RegisterAndLogInTestUserAsync();
        HttpResponseMessage response = await _client.GetAsync("/auth/self");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<ApiResponse<UserResponse>>();
        body?.Items.Should().NotBeNull()
            .And.HaveCount(1)
            .And.ContainSingle(u => u.Email == TestUser.Email);
    }

    [Fact]
    public async Task ReturnsAnError_WhenNotLoggedIn()
    {
        HttpResponseMessage response = await _client.GetAsync("/auth/self");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ReturnsAnError_WithValidTokenForInvalidUser()
    {
        // This is a manually-generated token for a user that shouldn't exist.
        var token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MDgxMDk4MC0zMWRjLTQxYjAtYjlhNi0xNjA0NDlhZmQzMDkiLCJqdGkiOiJhZWQzZWNiNi0xZjJiLTRjNWMtYTRmYS0zMmIwYzQ4MWM3YTYiLCJuYmYiOjE3MTE5NDc3NTEsImV4cCI6MTcxMjAzNDE1MSwiaWF0IjoxNzExOTQ3NzUxLCJpc3MiOiJodHRwczovL2FwaS5waGlsb3NvY29kZS5jb20iLCJhdWQiOiJodHRwczovL2NsaWVudC5waGlsb3NvY29kZS5jb20ifQ.Y--8VyuNmLM4EyRvyJ4yRz5AkgSoFnqAkIw8mugdcEW5gPsnt6GYd7CeL1m6CWV_DDKkW0ovB2scCKua-TxSMw";
        _client.SetBearerToken(token);

        HttpResponseMessage response = await _client.GetAsync("/auth/self");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
