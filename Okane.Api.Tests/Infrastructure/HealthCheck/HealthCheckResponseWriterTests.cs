using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Okane.Api.Infrastructure.HealthCheck;
using Okane.Api.Tests.Testing.Integration;

namespace Okane.Api.Tests.Infrastructure.HealthCheck;

public class HealthCheckResponseWriterTests(PostgresApiFactory apiFactory) : IClassFixture<PostgresApiFactory>
{
    private const string HealthyText = "Healthy";
    private readonly HttpClient _httpClient = apiFactory.CreateClient();

    [Fact]
    public async Task ReturnsAHealthCheckResponse()
    {
        HttpResponseMessage response = await _httpClient.GetAsync("/health");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var report = await response.Content.ReadFromJsonAsync<HealthCheckResponse>();
        report?.Status.Should().Be(HealthyText);
        report?.Entries[0].Status.Should().Be(HealthyText);
    }
}
