using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Endpoints;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Infrastructure.Database.Constants;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Constants;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.FinanceRecords.Endpoints;

public class PostFinanceRecordTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly PostgresApiFactory _apiFactory = apiFactory;
    private readonly HttpClient _client = apiFactory.CreateClient();

    private static readonly PostFinanceRecord.Request s_validRequest = new(
        100,
        "Groceries",
        DateTime.UtcNow,
        FinanceRecordType.Expense
    );

    [Fact]
    public async Task CreatesAFinanceRecord()
    {
        await _client.RegisterAndLogInTestUserAsync();

        var response = await _client.PostAsJsonAsync("/finance-records", s_validRequest);
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var itemsResponse = await response.Content.ReadFromJsonAsync<ApiResponse<FinanceRecordResponse>>();
        itemsResponse?.Items.Should().ContainSingle();

        var createdRecord = itemsResponse?.Items[0]!;
        createdRecord.Should().BeEquivalentTo(new FinanceRecordResponse
        {
            Amount = s_validRequest.Amount,
            Description = s_validRequest.Description,
            HappenedAt = s_validRequest.HappenedAt,
            Type = s_validRequest.Type,
            Id = createdRecord.Id
        });

        var expectedLocation = UrlUtils.GetUriByRouteName(
            _apiFactory,
            FinanceRecordEndpointNames.PostFinanceRecord,
            new { id = createdRecord.Id }
        );

        response.Headers.Location.Should().Be(expectedLocation);
    }

    public static TheoryData<PostFinanceRecord.Request> InvalidRequests => new()
    {
        s_validRequest with { Amount = -1 },
        s_validRequest with { Amount = 0 },
        s_validRequest with { Amount = (decimal)0.001 },
        s_validRequest with { Amount = 10_000_000 },
        s_validRequest with { Description = "" },
        s_validRequest with { Description = new string('a', DbConstants.MaxStringLength + 1) }
    };

    [Theory]
    [MemberData(nameof(InvalidRequests))]
    public async Task ReturnsAnError_WithAnInvalidRequest(PostFinanceRecord.Request request)
    {
        await _client.RegisterAndLogInTestUserAsync();

        var response = await _client.PostAsJsonAsync("/finance-records", request);
        response.Should().HaveStatusCode(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problemDetails?.Status.Should().Be(StatusCodes.Status400BadRequest);
        problemDetails?.Title.Should().Be(ValidationConstants.ValidationErrorTitle);
    }

    [Fact]
    public async Task ReturnsAnError_WithAnInvalidType()
    {
        await _client.RegisterAndLogInTestUserAsync();

        object request = new
        {
            Amount = 1,
            Description = "Test",
            HappendAt = s_validRequest.HappenedAt,
            Type = "InvalidType"
        };

        var response = await _client.PostAsJsonAsync("/finance-records", request);
        response.Should().HaveStatusCode(HttpStatusCode.BadRequest);
    }
}
