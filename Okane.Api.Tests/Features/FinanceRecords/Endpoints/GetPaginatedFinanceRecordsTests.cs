using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Mappers;
using Okane.Api.Shared.Constants;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Constants;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.FinanceRecords.Endpoints;

public class GetPaginatedFinanceRecordsTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    [Fact]
    public async Task ReturnsAPaginatedListOfFinanceRecords()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var financeRecords = new List<FinanceRecord>();
        const int pageSize = 2;
        const int totalItems = pageSize + 1;
        for (var i = 0; i < totalItems; i++)
        {
            financeRecords.Add(FinanceRecordStubFactory.Create(loginResponse.User.Id));
        }

        await Db.AddRangeAsync(financeRecords);
        await Db.SaveChangesAsync();

        var page1Response = await _client.GetAsync($"/finance-records?pageSize={pageSize}");
        page1Response.Should().HaveStatusCode(HttpStatusCode.OK);

        var page1 = await page1Response
            .Content
            .ReadFromJsonAsync<ApiPaginatedResponse<FinanceRecordResponse>>();

        page1?.TotalItems.Should().Be(totalItems);
        page1?.HasPreviousPage.Should().BeFalse();
        page1?.HasNextPage.Should().BeTrue();
        page1?.Items.Should().BeEquivalentTo(new List<FinanceRecordResponse>
        {
            financeRecords[2].ToFinanceRecordResponse(),
            financeRecords[1].ToFinanceRecordResponse()
        });

        var page2Response = await _client.GetAsync($"/finance-records?page=2&pageSize={pageSize}");
        page2Response.Should().HaveStatusCode(HttpStatusCode.OK);

        var page2 = await page2Response
            .Content
            .ReadFromJsonAsync<ApiPaginatedResponse<FinanceRecordResponse>>();

        page2?.TotalItems.Should().Be(totalItems);
        page2?.HasPreviousPage.Should().BeTrue();
        page2?.HasNextPage.Should().BeFalse();
        page2?.Items.Should().BeEquivalentTo(new List<FinanceRecordResponse>
        {
            financeRecords[0].ToFinanceRecordResponse()
        });

        var page3Response = await _client.GetAsync($"/finance-records?page=3&pageSize={pageSize}");
        page3Response.Should().HaveStatusCode(HttpStatusCode.OK);

        var page3 = await page3Response
            .Content
            .ReadFromJsonAsync<ApiPaginatedResponse<FinanceRecordResponse>>();

        page3?.HasPreviousPage.Should().BeTrue();
        page3?.HasNextPage.Should().BeFalse();
        page3?.TotalItems.Should().Be(totalItems);
        page3?.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task ExcludesFinanceRecordsCreatedByOtherUsers()
    {
        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmail(Db, otherUserEmail);
        var otherFinanceRecord = FinanceRecordStubFactory.Create(otherUser.Id);
        await Db.AddAsync(otherFinanceRecord);

        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var ownFinanceRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        await Db.AddAsync(ownFinanceRecord);

        await Db.SaveChangesAsync();

        var response = await _client.GetAsync("/finance-records");
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var financeRecords = await response
            .Content
            .ReadFromJsonAsync<ApiPaginatedResponse<FinanceRecordResponse>>();

        financeRecords?.HasPreviousPage.Should().BeFalse();
        financeRecords?.HasNextPage.Should().BeFalse();
        financeRecords?.TotalItems.Should().Be(1);
        financeRecords?.Items.Should().ContainSingle(
            r => r.Id == ownFinanceRecord.Id
        );
    }

    // Validate query parameters.
    public static TheoryData<string, Dictionary<string, string[]>> InvalidSortQueryParameters => new()
    {
        {
            "sortField=blah",
            new Dictionary<string, string[]>
            {
                { "SortField", [FinanceRecordSortFields.AllowedFieldsMessage] }
            }
        },
        {
            "sortDirection=blah",
            new Dictionary<string, string[]>
            {
                { "SortDirection", [SortDirections.AllowedOptionsValidationMessage] }
            }
        }
    };

    [Theory]
    [MemberData(nameof(InvalidSortQueryParameters))]
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
        await Db.AddRangeAsync(financeRecords);
        await Db.SaveChangesAsync();

        var response = await _client.GetAsync($"/finance-records?{queryString}");
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var page = await response
            .Content
            .ReadFromJsonAsync<ApiPaginatedResponse<FinanceRecordResponse>>();

        var expectedFinanceRecords = getExpectedFinanceRecords(financeRecords);
        var expectedItems = expectedFinanceRecords.Select(fr => fr.ToFinanceRecordResponse());
        page?.Items.Should().BeEquivalentTo(expectedItems);
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

    // Filtering.
    [Fact]
    public async Task ReturnsAListOfFinanceRecords_FilteredByDescription_WithSingleSearchTerm()
    {
        await AssertFinanceRecordsAreSortedAndFiltered(
            "description=sir",
            userId =>
            {
                var financeRecords = new List<FinanceRecord>
                {
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId)
                };

                financeRecords[0].Description = "Sir Doggo"; // First word exact match.
                financeRecords[1].Description = "Sirloin steak"; // First word partial match.
                financeRecords[2].Description = "Yes sir"; // Different word exact match.
                financeRecords[3].Description = "Yes sirloin"; // Different word partial match.
                financeRecords[4].Description = "Random text 123";

                return financeRecords;
            },
            financeRecords =>
            [
                financeRecords[0],
                financeRecords[1],
                financeRecords[2],
                financeRecords[3],
            ]
        );
    }

    [Fact]
    public async Task ReturnsAListOfFinanceRecords_FilteredByDescription_WithMultipleSearchTerms()
    {
        await AssertFinanceRecordsAreSortedAndFiltered(
            "description=hi bye",
            userId =>
            {
                var financeRecords = new List<FinanceRecord>
                {
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId)
                };

                financeRecords[0].Description = "Hi bye"; // Exact phrase match.
                financeRecords[1].Description = "Hi apple bye"; // Phrase match with extra word.
                financeRecords[2].Description = "Hi there"; // First word match.
                financeRecords[3].Description = "Hey bye"; // Second word match.
                financeRecords[4].Description = "Random text 123";

                return financeRecords;
            },
            financeRecords =>
            [
                financeRecords[0],
                financeRecords[1]
            ]
        );
    }


    [Fact]
    public async Task ReturnsAListOfFinanceRecords_FilteredByHappenedAtBefore()
    {
        await AssertFinanceRecordsAreSortedAndFiltered(
            "happenedBefore=2024-10-10T10:10:10.000Z",
            userId =>
            {
                var financeRecords = new List<FinanceRecord>
                {
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId)
                };

                var happenedAt = new DateTime(2024, 10, 10, 10, 10, 10, DateTimeKind.Utc);

                financeRecords[0].HappenedAt = happenedAt;
                financeRecords[1].HappenedAt = happenedAt.AddMilliseconds(-1);
                financeRecords[2].HappenedAt = happenedAt.AddMilliseconds(1);

                return financeRecords;
            },
            financeRecords =>
            [
                financeRecords[0],
                financeRecords[1]
            ]
        );
    }

    [Fact]
    public async Task ReturnsAListOfFinanceRecords_FilteredByHappenedAtAfter()
    {
        await AssertFinanceRecordsAreSortedAndFiltered(
            "happenedAfter=2024-10-10T10:10:10.000Z",
            userId =>
            {
                var financeRecords = new List<FinanceRecord>
                {
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId)
                };

                var happenedAt = new DateTime(2024, 10, 10, 10, 10, 10, DateTimeKind.Utc);

                financeRecords[0].HappenedAt = happenedAt;
                financeRecords[1].HappenedAt = happenedAt.AddMilliseconds(-1);
                financeRecords[2].HappenedAt = happenedAt.AddMilliseconds(1);

                return financeRecords;
            },
            financeRecords =>
            [
                financeRecords[0],
                financeRecords[2]
            ]
        );
    }

    [Fact]
    public async Task ReturnsAListOfFinanceRecords_FilteredByMinAmount()
    {
        await AssertFinanceRecordsAreSortedAndFiltered(
            "minAmount=1.50",
            userId =>
            {
                var financeRecords = new List<FinanceRecord>
                {
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId)
                };

                financeRecords[0].Amount = 0.5m;
                financeRecords[1].Amount = 1.49m;
                financeRecords[2].Amount = 1.5m;
                financeRecords[3].Amount = 2.5m;

                return financeRecords;
            },
            financeRecords =>
            [
                financeRecords[2],
                financeRecords[3]
            ]
        );
    }

    [Fact]
    public async Task ReturnsAListOfFinanceRecords_FilteredByMaxAmount()
    {
        await AssertFinanceRecordsAreSortedAndFiltered(
            "maxAmount=2.50",
            userId =>
            {
                var financeRecords = new List<FinanceRecord>
                {
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId)
                };

                financeRecords[0].Amount = 0;
                financeRecords[1].Amount = 2.49m;
                financeRecords[2].Amount = 2.5m;
                financeRecords[3].Amount = 3;

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
    public async Task ReturnsAListOfFinanceRecords_FilteredByType()
    {
        await AssertFinanceRecordsAreSortedAndFiltered(
            "type=Revenue",
            userId =>
            {
                var financeRecords = new List<FinanceRecord>
                {
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId)
                };

                financeRecords[0].Type = FinanceRecordType.Expense;
                financeRecords[1].Type = FinanceRecordType.Revenue;
                financeRecords[2].Type = FinanceRecordType.Expense;

                return financeRecords;
            },
            financeRecords =>
            [
                financeRecords[1]
            ]
        );
    }

    [Fact]
    public async Task ReturnsAListOfFinanceRecords_FilteredByMultipleFields()
    {
        await AssertFinanceRecordsAreSortedAndFiltered(
            "happenedAfter=2024-10-10T10:10:10.000Z&happenedBefore=2024-10-11T10:10:10.000Z&type=Revenue",
            userId =>
            {
                var financeRecords = new List<FinanceRecord>
                {
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                    FinanceRecordStubFactory.Create(userId),
                };

                var happenedAAfter = new DateTime(2024, 10, 10, 10, 10, 10, DateTimeKind.Utc);

                // Ignored due to type.
                financeRecords[0].HappenedAt = happenedAAfter;
                financeRecords[0].Type = FinanceRecordType.Expense;

                // Selected.
                financeRecords[1].HappenedAt = happenedAAfter.AddHours(1);
                financeRecords[1].Type = FinanceRecordType.Revenue;

                // Ignored due to happenedAfter.
                financeRecords[2].HappenedAt = happenedAAfter.AddMilliseconds(-1);
                financeRecords[2].Type = FinanceRecordType.Revenue;

                // Selected.
                financeRecords[3].HappenedAt = happenedAAfter.AddHours(1);
                financeRecords[3].Type = FinanceRecordType.Revenue;

                return financeRecords;
            },
            financeRecords =>
            [
                financeRecords[1],
                financeRecords[3],
            ]
        );
    }

    // Sorting and filtering.
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

                var happenedAAfter = new DateTime(2024, 10, 10, 10, 10, 10, DateTimeKind.Utc);

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
