using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
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
    private static readonly FinanceRecordsStats s_emptyStats = new();

    private static FinanceRecord CreateRecordWithAmountAndType(
        decimal amount,
        FinanceRecordType type,
        string userId)
    {
        var record = FinanceRecordStubFactory.Create(userId);
        record.Amount = amount;
        record.Type = type;

        return record;
    }

    private async Task<FinanceRecordsStats> FetchStatsAsync(string queryString = "")
    {
        var url = "/finance-records/stats";
        if (queryString != "")
        {
            url += $"?{queryString}";
        }

        var response = await _client.GetAsync(url);
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<FinanceRecordsStats>>();
        return apiResponse!.Items[0];
    }

    [Fact]
    public async Task ReturnsStats_FilteredByAmount()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var record = CreateRecordWithAmountAndType(10, FinanceRecordType.Revenue, loginResponse.User.Id);
        Db.Add(record);
        await Db.SaveChangesAsync();

        var matchingStats = s_emptyStats with
        {
            RevenueRecords = 1,
            TotalRevenue = record.Amount
        };

        var stats = await FetchStatsAsync($"minAmount={record.Amount + 0.01m}");
        stats.Should().BeEquivalentTo(s_emptyStats);

        stats = await FetchStatsAsync($"minAmount={record.Amount}");
        stats.Should().BeEquivalentTo(matchingStats);

        stats = await FetchStatsAsync($"maxAmount={record.Amount - 0.01m}");
        stats.Should().BeEquivalentTo(s_emptyStats);

        stats = await FetchStatsAsync($"maxAmount={record.Amount}");
        stats.Should().BeEquivalentTo(matchingStats);
    }

    [Fact]
    public async Task ReturnsStats_FilteredByDescription()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var record = CreateRecordWithAmountAndType(10, FinanceRecordType.Revenue, loginResponse.User.Id);
        record.Description = "Hello World";
        Db.Add(record);
        await Db.SaveChangesAsync();

        var matchingStats = s_emptyStats with
        {
            RevenueRecords = 1,
            TotalRevenue = record.Amount
        };

        var stats = await FetchStatsAsync("description=Goodbye");
        stats.Should().BeEquivalentTo(s_emptyStats);

        stats = await FetchStatsAsync("description=hello");
        stats.Should().BeEquivalentTo(matchingStats);
    }

    [Fact]
    public async Task ReturnsStats_FilteredByHappenedAt()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var record = CreateRecordWithAmountAndType(10, FinanceRecordType.Revenue, loginResponse.User.Id);
        record.HappenedAt = new DateTime(2010, 10, 10, 10, 10, 10, DateTimeKind.Utc);
        Db.Add(record);
        await Db.SaveChangesAsync();

        var matchingStats = s_emptyStats with
        {
            RevenueRecords = 1,
            TotalRevenue = record.Amount
        };

        var stats = await FetchStatsAsync("happenedAfter=2010-10-10T10:10:11.000Z");
        stats.Should().BeEquivalentTo(s_emptyStats);

        stats = await FetchStatsAsync("happenedAfter=2010-10-10T10:10:09.000Z");
        stats.Should().BeEquivalentTo(matchingStats);

        stats = await FetchStatsAsync("happenedBefore=2010-10-10T10:10:09.000Z");
        stats.Should().BeEquivalentTo(s_emptyStats);

        stats = await FetchStatsAsync("happenedAfter=2010-10-10T10:10:10.000Z");
        stats.Should().BeEquivalentTo(matchingStats);
    }

    [Fact]
    public async Task ReturnsStats_FilteredByType()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var userId = loginResponse.User.Id;

        var revenue1 = CreateRecordWithAmountAndType(5.40m, FinanceRecordType.Revenue, userId);
        var revenue2 = CreateRecordWithAmountAndType(7.20m, FinanceRecordType.Revenue, userId);
        var expense1 = CreateRecordWithAmountAndType(3.60m, FinanceRecordType.Expense, userId);
        var expense2 = CreateRecordWithAmountAndType(3.60m, FinanceRecordType.Expense, userId);
        Db.AddRange(revenue1, expense1, revenue2, expense2);
        await Db.SaveChangesAsync();

        var expenseStats = await FetchStatsAsync("type=Expense");
        expenseStats.Should().BeEquivalentTo(s_emptyStats with
        {
            TotalExpenses = expense1.Amount + expense2.Amount,
            ExpenseRecords = 2
        });

        var allStats = await FetchStatsAsync();
        allStats.Should().BeEquivalentTo(new FinanceRecordsStats
        {
            TotalExpenses = expense1.Amount + expense2.Amount,
            ExpenseRecords = 2,
            TotalRevenue = revenue1.Amount + revenue2.Amount,
            RevenueRecords = 2
        });
    }

    [Fact]
    public async Task ReturnsStats_FilteredByMultipleCriteria()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var record = CreateRecordWithAmountAndType(10, FinanceRecordType.Revenue, loginResponse.User.Id);
        Db.Add(record);
        await Db.SaveChangesAsync();

        var stats = await FetchStatsAsync($"minAmount={record.Amount}&type=Expense");
        stats.Should().BeEquivalentTo(s_emptyStats);

        stats = await FetchStatsAsync($"minAmount={record.Amount}&type=Revenue");
        stats.Should().BeEquivalentTo(s_emptyStats with
        {
            RevenueRecords = 1,
            TotalRevenue = record.Amount
        });
    }


    [Fact]
    public async Task ReturnsEmptyStats_WithNoMatchingFinanceRecords()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var stats = await FetchStatsAsync();
        stats.Should().BeEquivalentTo(s_emptyStats);

        var revenueRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        revenueRecord.Type = FinanceRecordType.Revenue;
        Db.Add(revenueRecord);
        await Db.SaveChangesAsync();

        stats = await FetchStatsAsync("type=Expense");
        stats.Should().BeEquivalentTo(s_emptyStats);
    }

    [Fact]
    public async Task ExcludesRecordsCreatedByOtherUsers()
    {
        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);
        var otherRecord = CreateRecordWithAmountAndType(1, FinanceRecordType.Revenue, otherUser.Id);

        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var ownRecord = CreateRecordWithAmountAndType(2, FinanceRecordType.Expense, loginResponse.User.Id);

        Db.AddRange(otherRecord, ownRecord);
        await Db.SaveChangesAsync();

        var stats = await FetchStatsAsync();
        stats.Should().BeEquivalentTo(new FinanceRecordsStats
        {
            ExpenseRecords = 1,
            TotalExpenses = ownRecord.Amount
        });
    }

    [Theory]
    [ClassData(typeof(GetFinanceRecordsInvalidFilterQueryParameters))]
    public async Task ReturnsAValidationError_WhenQueryStringIsInvalid(
        string queryString,
        Dictionary<string, string[]> expectedErrors)
    {
        await _client.RegisterAndLogInTestUserAsync();
        var response = await _client.GetAsync($"/finance-records/stats?{queryString}");
        response.Should().HaveStatusCode(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problemDetails?.Status.Should().Be(StatusCodes.Status400BadRequest);
        problemDetails?.Title.Should().Be(ValidationConstants.ValidationErrorTitle);
        problemDetails?.Errors.Should().BeEquivalentTo(expectedErrors);
    }
}
