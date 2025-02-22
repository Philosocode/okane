using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Shared.Constants;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Constants;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.TestData;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Finances.Endpoints;

public class GetFinanceRecordsStatsTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    // Validation.
    [Theory]
    [ClassData(typeof(GetFinanceRecordsInvalidFilterQueryParameters))]
    [ClassData(typeof(GetFinanceRecordsStatsInvalidQueryParameters))]
    public async Task ReturnsAValidationError_WhenQueryStringIsInvalid(
        string queryString,
        Dictionary<string, string[]> expectedErrors)
    {
        await _client.RegisterAndLogInTestUserAsync();
        var response = await _client.GetAsync($"/finance-records/stats?{queryString}&timeInterval=month");
        response.Should().HaveStatusCode(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problemDetails?.Status.Should().Be(StatusCodes.Status400BadRequest);
        problemDetails?.Title.Should().Be(ValidationConstants.ValidationErrorTitle);
        problemDetails?.Errors.Should().BeEquivalentTo(expectedErrors);
    }

    [Fact]
    public async Task ReturnsAnError_WhenTimeIntervalIsMissing()
    {
        await _client.RegisterAndLogInTestUserAsync();
        var response = await _client.GetAsync("/finance-records/stats");
        response.Should().HaveStatusCode(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        problemDetails?.Status.Should().Be(StatusCodes.Status400BadRequest);
        problemDetails?.Title.Should().Be(nameof(BadHttpRequestException));
    }

    // Helpers.
    private static FinanceRecord GetTestFinanceRecord(
        decimal amount,
        DateTime happenedAt,
        FinanceRecordType type,
        string userId)
    {
        var financeRecord = FinanceRecordStubFactory.Create(userId);
        financeRecord.Amount = amount;
        financeRecord.HappenedAt = happenedAt;
        financeRecord.Type = type;

        return financeRecord;
    }

    private static void PopulateAmountsAndCounts(IList<FinanceRecord> financeRecords, FinanceRecordsStats stats)
    {
        foreach (var financeRecord in financeRecords)
        {
            if (financeRecord.Type == FinanceRecordType.Expense)
            {
                stats.ExpenseRecords++;
                stats.TotalExpenses += financeRecord.Amount;
            }
            else
            {
                stats.RevenueRecords++;
                stats.TotalRevenue += financeRecord.Amount;
            }
        }
    }

    // Test skeleton algorithm.
    private async Task AssertExpectedStats(
        IList<FinanceRecord> financeRecords,
        string timeInterval,
        FinanceRecordsStats expectedStats)
    {
        Db.AddRange(financeRecords);
        await Db.SaveChangesAsync();

        var response = await _client.GetAsync($"/finance-records/stats?timeInterval={timeInterval}");
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<FinanceRecordsStats>>();
        apiResponse!.Items.Should().HaveCount(1);
        apiResponse.Items[0].Should().BeEquivalentTo(expectedStats);
    }

    // Main tests.
    [Fact]
    public async Task ReturnsEmptyStats_WithNoMatchingFinanceRecords()
    {
        await _client.RegisterAndLogInTestUserAsync();
        await AssertExpectedStats([], TimeIntervals.Day, new FinanceRecordsStats());
    }

    [Fact]
    public async Task GroupsStatsByDay()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var userId = loginResponse.User.Id;

        var dates = new List<DateTime>
        {
            DateTimeUtils.GetUtcDate(2024, 12, 31),
            DateTimeUtils.GetUtcDate(2025, 1, 1),
            DateTimeUtils.GetUtcDate(2025, 1, 3)
        };

        var financeRecords = new List<FinanceRecord>
        {
            GetTestFinanceRecord(1, dates[0], FinanceRecordType.Expense, userId),
            GetTestFinanceRecord(1, dates[0], FinanceRecordType.Expense, userId),
            GetTestFinanceRecord(1, dates[0], FinanceRecordType.Revenue, userId),
            GetTestFinanceRecord(1, dates[0], FinanceRecordType.Revenue, userId),

            GetTestFinanceRecord(2, dates[1], FinanceRecordType.Expense, userId),
            GetTestFinanceRecord(2, dates[1], FinanceRecordType.Expense, userId),
            GetTestFinanceRecord(2, dates[1], FinanceRecordType.Revenue, userId),

            GetTestFinanceRecord(3, dates[2], FinanceRecordType.Expense, userId)
        };

        var expectedStats = new FinanceRecordsStats
        {
            Dates = [dates[0], dates[1], DateTimeUtils.GetUtcDate(2025, 1, 2), dates[2]],
            ExpensesByDate = [2, 4, 0, 3],
            RevenuesByDate = [2, 2, 0, 0]
        };
        PopulateAmountsAndCounts(financeRecords, expectedStats);

        await AssertExpectedStats(financeRecords, TimeIntervals.Day, expectedStats);
    }

    [Fact]
    public async Task GroupsStatsByWeek()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var userId = loginResponse.User.Id;

        var dates = new List<DateTime>
        {
            DateTimeUtils.GetUtcDate(2024, 12, 31), // Week starts on the 30th.
            DateTimeUtils.GetUtcDate(2025, 1, 4), // Week starts on the 30th.
            DateTimeUtils.GetUtcDate(2025, 1, 15) // Week starts on the 13th.
        };

        var financeRecords = new List<FinanceRecord>
        {
            GetTestFinanceRecord(1, dates[0], FinanceRecordType.Expense, userId),
            GetTestFinanceRecord(1, dates[0], FinanceRecordType.Expense, userId),
            GetTestFinanceRecord(1, dates[0], FinanceRecordType.Revenue, userId),
            GetTestFinanceRecord(1, dates[0], FinanceRecordType.Revenue, userId),

            GetTestFinanceRecord(2, dates[1], FinanceRecordType.Expense, userId),
            GetTestFinanceRecord(2, dates[1], FinanceRecordType.Expense, userId),
            GetTestFinanceRecord(2, dates[1], FinanceRecordType.Revenue, userId),

            GetTestFinanceRecord(3, dates[2], FinanceRecordType.Expense, userId)
        };

        var expectedStats = new FinanceRecordsStats
        {
            Dates =
            [
                DateTimeUtils.GetUtcDate(2024, 12, 30),
                DateTimeUtils.GetUtcDate(2025, 1, 6),
                DateTimeUtils.GetUtcDate(2025, 1, 13)
            ],
            ExpensesByDate = [6, 0, 3],
            RevenuesByDate = [4, 0, 0]
        };
        PopulateAmountsAndCounts(financeRecords, expectedStats);

        await AssertExpectedStats(financeRecords, TimeIntervals.Week, expectedStats);
    }

    [Fact]
    public async Task GroupsStatsByMonth()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var userId = loginResponse.User.Id;

        var dates = new List<DateTime>
        {
            DateTimeUtils.GetUtcDate(2024, 12, 1),
            DateTimeUtils.GetUtcDate(2024, 12, 31),
            DateTimeUtils.GetUtcDate(2025, 1, 4),
            DateTimeUtils.GetUtcDate(2025, 3, 15)
        };

        var financeRecords = new List<FinanceRecord>
        {
            GetTestFinanceRecord(1, dates[0], FinanceRecordType.Expense, userId),
            GetTestFinanceRecord(1, dates[0], FinanceRecordType.Revenue, userId),

            GetTestFinanceRecord(2, dates[1], FinanceRecordType.Expense, userId),
            GetTestFinanceRecord(2, dates[1], FinanceRecordType.Revenue, userId),

            GetTestFinanceRecord(3, dates[2], FinanceRecordType.Expense, userId),

            GetTestFinanceRecord(3, dates[3], FinanceRecordType.Revenue, userId)
        };

        var expectedStats = new FinanceRecordsStats
        {
            Dates =
            [
                DateTimeUtils.GetUtcDate(2024, 12, 1),
                DateTimeUtils.GetUtcDate(2025, 1, 1),
                DateTimeUtils.GetUtcDate(2025, 2, 1),
                DateTimeUtils.GetUtcDate(2025, 3, 1)
            ],
            ExpensesByDate = [3, 3, 0, 0],
            RevenuesByDate = [3, 0, 0, 3]
        };
        PopulateAmountsAndCounts(financeRecords, expectedStats);

        await AssertExpectedStats(financeRecords, TimeIntervals.Month, expectedStats);
    }

    [Fact]
    public async Task GroupsStatsByYear()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var userId = loginResponse.User.Id;

        var dates = new List<DateTime>
        {
            DateTimeUtils.GetUtcDate(2024, 1, 1),
            DateTimeUtils.GetUtcDate(2024, 12, 31),
            DateTimeUtils.GetUtcDate(2025, 6, 15),
            DateTimeUtils.GetUtcDate(2027, 12, 31)
        };

        var financeRecords = new List<FinanceRecord>
        {
            GetTestFinanceRecord(1, dates[0], FinanceRecordType.Expense, userId),
            GetTestFinanceRecord(1, dates[0], FinanceRecordType.Revenue, userId),

            GetTestFinanceRecord(2, dates[1], FinanceRecordType.Expense, userId),
            GetTestFinanceRecord(2, dates[1], FinanceRecordType.Revenue, userId),

            GetTestFinanceRecord(3, dates[2], FinanceRecordType.Expense, userId),

            GetTestFinanceRecord(3, dates[3], FinanceRecordType.Revenue, userId)
        };

        var expectedStats = new FinanceRecordsStats
        {
            Dates =
            [
                DateTimeUtils.GetUtcDate(2024, 1, 1),
                DateTimeUtils.GetUtcDate(2025, 1, 1),
                DateTimeUtils.GetUtcDate(2026, 1, 1),
                DateTimeUtils.GetUtcDate(2027, 1, 1)
            ],
            ExpensesByDate = [3, 3, 0, 0],
            RevenuesByDate = [3, 0, 0, 3]
        };
        PopulateAmountsAndCounts(financeRecords, expectedStats);

        await AssertExpectedStats(financeRecords, TimeIntervals.Year, expectedStats);
    }
}
