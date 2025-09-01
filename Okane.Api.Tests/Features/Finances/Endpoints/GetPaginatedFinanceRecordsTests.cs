using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Mappers;
using Okane.Api.Shared.Constants;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Constants;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.TestData;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Finances.Endpoints;

public class GetPaginatedFinanceRecordsTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    private string GetCursorQueryString(FinanceRecord financeRecord, int pageSize, string sortField, string sortDirection)
    {
        var dict = new Dictionary<string, string?>
        {
            { "cursorId", financeRecord.Id.ToString() },
            { "pageSize", pageSize.ToString(CultureInfo.InvariantCulture) }
        };

        if (sortField == FinanceRecordSortFields.Amount)
        {
            dict.Add("cursorAmount", financeRecord.Amount.ToString(CultureInfo.CurrentCulture));
        }
        else
        {
            dict.Add("cursorHappenedAt", financeRecord.HappenedAt.ToString(CultureInfo.CurrentCulture));
        }

        dict.Add("sortDirection", sortDirection);

        return QueryHelpers.AddQueryString("", dict);
    }

    [Fact]
    public async Task ReturnsAPaginatedListOfFinanceRecords()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var financeRecords = new List<FinanceRecord>();
        const int pageSize = 2;
        const int totalItems = pageSize + 1;
        for (var i = 0; i < totalItems; i++)
        {
            var financeRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
            financeRecord.Amount = (decimal)(i + 1.11);
            financeRecords.Add(financeRecord);
        }

        Db.AddRange(financeRecords);
        await Db.SaveChangesAsync();

        var queryString = $"pageSize={pageSize}&sortField=amount&sortDirection=asc";
        var page1Response = await _client.GetAsync($"/finance-records?{queryString}");
        page1Response.Should().HaveStatusCode(HttpStatusCode.OK);

        var page1 = await page1Response
            .Content
            .ReadFromJsonAsync<ApiPaginatedResponse<FinanceRecordResponse>>();

        page1?.HasNextPage.Should().BeTrue();
        page1?.Items.Should().BeEquivalentTo(new List<FinanceRecordResponse>
        {
            financeRecords[0].ToFinanceRecordResponse(),
            financeRecords[1].ToFinanceRecordResponse()
        });

        queryString = GetCursorQueryString(
            financeRecords[1], pageSize, FinanceRecordSortFields.Amount, SortDirections.Asc
        );
        var page2Response = await _client.GetAsync($"/finance-records{queryString}");
        page2Response.Should().HaveStatusCode(HttpStatusCode.OK);

        var page2 = await page2Response
            .Content
            .ReadFromJsonAsync<ApiPaginatedResponse<FinanceRecordResponse>>();

        page2?.HasNextPage.Should().BeFalse();
        page2?.Items.Should().BeEquivalentTo(new List<FinanceRecordResponse>
        {
            financeRecords[2].ToFinanceRecordResponse()
        });

        queryString = GetCursorQueryString(
            financeRecords[2], pageSize, FinanceRecordSortFields.Amount, SortDirections.Asc
        );
        var page3Response = await _client.GetAsync($"/finance-records{queryString}");
        page3Response.Should().HaveStatusCode(HttpStatusCode.OK);

        var page3 = await page3Response
            .Content
            .ReadFromJsonAsync<ApiPaginatedResponse<FinanceRecordResponse>>();

        page3?.HasNextPage.Should().BeFalse();
        page3?.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task IncludesFinanceRecordTags()
    {
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 2);
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var financeRecords = new List<FinanceRecord>();
        for (var i = 0; i < 2; i++)
        {
            var financeRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
            financeRecord.Tags = tags;
            financeRecords.Add(financeRecord);
        }

        Db.AddRange(financeRecords);
        await Db.SaveChangesAsync();

        var response = await _client.GetAsync($"/finance-records?pageSize={financeRecords.Count}");
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var page = await response
            .Content
            .ReadFromJsonAsync<ApiPaginatedResponse<FinanceRecordResponse>>();

        var tagIds = tags.Select(t => t.Id).ToList();
        foreach (var financeRecordResponse in page!.Items)
        {
            financeRecordResponse.Tags.Select(t => t.Id).Should().BeEquivalentTo(tagIds);
        }
    }

    // Validate query parameters.
    [Theory]
    [ClassData(typeof(GetFinanceRecordsInvalidCursorQueryParameters))]
    [ClassData(typeof(GetFinanceRecordsInvalidFilterQueryParameters))]
    [ClassData(typeof(GetFinanceRecordsInvalidSortQueryParameters))]
    [ClassData(typeof(InvalidPageQueryParameters))]
    public async Task ReturnsAValidationError_WhenAQueryParameterIsInvalid(
        string queryString,
        Dictionary<string, string[]> expectedErrors)
    {
        await _client.RegisterAndLogInTestUserAsync();
        var response = await _client.GetAsync($"/finance-records?{queryString}");
        response.Should().HaveStatusCode(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problemDetails?.Status.Should().Be(StatusCodes.Status400BadRequest);
        problemDetails?.Title.Should().Be(ValidationConstants.ValidationErrorTitle);
        problemDetails?.Errors.Should().BeEquivalentTo(expectedErrors);
    }

    private async Task AssertFinanceRecordsAreSortedAndFiltered(
        string queryString,
        Func<string, IList<FinanceRecord>> getInputFinanceRecords,
        Func<IList<FinanceRecord>, IList<FinanceRecord>> getExpectedFinanceRecords)
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var financeRecords = getInputFinanceRecords(loginResponse.User.Id);
        Db.AddRange(financeRecords);
        await Db.SaveChangesAsync();

        var response = await _client.GetAsync($"/finance-records?{queryString}");
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var page = await response
            .Content
            .ReadFromJsonAsync<ApiPaginatedResponse<FinanceRecordResponse>>();

        var expectedFinanceRecords = getExpectedFinanceRecords(financeRecords);
        var expectedItems = expectedFinanceRecords.Select(fr => fr.ToFinanceRecordResponse());
        page?.Items.Should().BeEquivalentTo(
            expectedItems,
            options => options.For(fr => fr.Tags).Exclude(t => t.FinanceRecords)
        );
    }

    // Sorting.
    [Fact]
    public async Task ReturnsAListOfFinanceRecords_SortedInDefaultOrder()
    {
        await AssertFinanceRecordsAreSortedAndFiltered(
            "",
            userId =>
            {
                var financeRecords = new List<FinanceRecord>
                {
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId)
                };

                var now = DateTime.UtcNow;
                financeRecords[0].HappenedAt = now;
                financeRecords[1].HappenedAt = now;
                financeRecords[2].HappenedAt = now.AddYears(1);

                return financeRecords;
            },
            financeRecords =>
            [
                financeRecords[1],
                financeRecords[0],
                financeRecords[2]
            ]
        );
    }

    [Fact]
    public async Task ReturnsAListOfFinanceRecords_SortedByAmountAscending()
    {
        await AssertFinanceRecordsAreSortedAndFiltered(
            "sortField=amount&sortDirection=asc",
            userId =>
            {
                var financeRecords = new List<FinanceRecord>
                {
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId)
                };

                financeRecords[0].Amount = 0.5m;
                financeRecords[1].Amount = 1;
                financeRecords[2].Amount = 0.5m;

                return financeRecords;
            },
            financeRecords =>
            [
                financeRecords[0],
                financeRecords[2],
                financeRecords[1]
            ]
        );
    }

    [Fact]
    public async Task ReturnsAListOfFinanceRecords_SortedByAmountDescending()
    {
        await AssertFinanceRecordsAreSortedAndFiltered(
            "sortField=amount&sortDirection=desc",
            userId =>
            {
                var financeRecords = new List<FinanceRecord>
                {
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId)
                };

                financeRecords[0].Amount = 0.5m;
                financeRecords[1].Amount = 1;
                financeRecords[2].Amount = 0.5m;

                return financeRecords;
            },
            financeRecords =>
            [
                financeRecords[1],
                financeRecords[0],
                financeRecords[2]
            ]
        );
    }


    [Fact]
    public async Task ReturnsAListOfFinanceRecords_SortedByHappenedAtAscending()
    {
        await AssertFinanceRecordsAreSortedAndFiltered(
            "sortField=happenedAt&sortDirection=asc",
            userId =>
            {
                var financeRecords = new List<FinanceRecord>
                {
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId)
                };

                var now = DateTime.UtcNow;
                financeRecords[0].HappenedAt = now;
                financeRecords[1].HappenedAt = now;
                financeRecords[2].HappenedAt = now.AddYears(1);

                return financeRecords;
            },
            financeRecords =>
            [
                financeRecords[0],
                financeRecords[1],
                financeRecords[2]
            ]
        );
    }

    [Fact]
    public async Task ReturnsAListOfFinanceRecords_SortedByHappenedAtDescending()
    {
        await AssertFinanceRecordsAreSortedAndFiltered(
            "sortField=happenedAt&sortDirection=desc",
            userId =>
            {
                var financeRecords = new List<FinanceRecord>
                {
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId)
                };

                var now = DateTime.UtcNow;
                financeRecords[0].HappenedAt = now;
                financeRecords[1].HappenedAt = now;
                financeRecords[2].HappenedAt = now.AddYears(1);

                return financeRecords;
            },
            financeRecords =>
            [
                financeRecords[2],
                financeRecords[0],
                financeRecords[1]
            ]
        );
    }

    [Fact]
    public async Task ReturnsAListOfSortedAndFilteredFinanceRecords()
    {
        await AssertFinanceRecordsAreSortedAndFiltered(
            "description=sir&sortField=amount&sortDirection=desc",
            userId =>
            {
                var financeRecords = new List<FinanceRecord>
                {
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                };

                financeRecords[0].Amount = 0;
                financeRecords[0].Description = "Hello";

                // Selected.
                financeRecords[1].Amount = 9.9m;
                financeRecords[1].Description = "Sir 1";

                financeRecords[2].Amount = 20;

                // Selected.
                financeRecords[3].Amount = 10;
                financeRecords[3].Description = "Sir 2";

                return financeRecords;
            },
            financeRecords =>
            [
                financeRecords[3],
                financeRecords[1],
            ]
        );
    }
}
