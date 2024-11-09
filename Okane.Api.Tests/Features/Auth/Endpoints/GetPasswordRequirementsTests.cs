using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Integration;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class GetPasswordRequirementsTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    [Fact]
    public async Task ReturnsThePasswordRequirements()
    {
        var response = await _client.GetAsync("/auth/password-requirements");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<ApiResponse<PasswordRequirementsResponse>>();
        body?.Items.Should().NotBeNull().And.HaveCount(1);
    }
}
