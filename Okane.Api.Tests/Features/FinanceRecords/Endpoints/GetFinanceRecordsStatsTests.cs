using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.FinanceRecords.Endpoints;

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

    [Fact]
    public async Task ReturnsStats_MatchingTheSearchFilters()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var userId = loginResponse.User.Id;

        var revenue1 = CreateRecordWithAmountAndType(5.40m, FinanceRecordType.Revenue, userId);
        var revenue2 = CreateRecordWithAmountAndType(7.20m, FinanceRecordType.Revenue, userId);
        var expense1 = CreateRecordWithAmountAndType(3.60m, FinanceRecordType.Expense, userId);
        var expense2 = CreateRecordWithAmountAndType(3.60m, FinanceRecordType.Expense, userId);
        await Db.AddRangeAsync([revenue1, expense1, revenue2, expense2]);
        await Db.SaveChangesAsync();

        var expenseResponse = await _client.GetAsync("/finance-records/stats?Type=Expense");
        expenseResponse.Should().HaveStatusCode(HttpStatusCode.OK);

        var expenseApiResponse = await expenseResponse
            .Content
            .ReadFromJsonAsync<ApiResponse<FinanceRecordsStats>>();
        expenseApiResponse?.Items[0].Should().BeEquivalentTo(s_emptyStats with
        {
            TotalExpenses = expense1.Amount + expense2.Amount,
            ExpenseRecords = 2
        });

        var allResponse = await _client.GetAsync("/finance-records/stats");
        allResponse.Should().HaveStatusCode(HttpStatusCode.OK);

        var allApiResponse = await allResponse
            .Content
            .ReadFromJsonAsync<ApiResponse<FinanceRecordsStats>>();
        allApiResponse?.Items[0].Should().BeEquivalentTo(new FinanceRecordsStats
        {
            TotalExpenses = expense1.Amount + expense2.Amount,
            ExpenseRecords = 2,
            TotalRevenue = revenue1.Amount + revenue2.Amount,
            RevenueRecords = 2
        });
    }

    [Fact]
    public async Task ReturnsEmptyStats_WithNoMatchingFinanceRecords()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var response = await _client.GetAsync("/finance-records/stats");
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var apiResponse = await response
            .Content
            .ReadFromJsonAsync<ApiResponse<FinanceRecordsStats>>();
        apiResponse?.Items[0].Should().BeEquivalentTo(s_emptyStats);

        var revenueRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        revenueRecord.Type = FinanceRecordType.Revenue;
        await Db.AddAsync(revenueRecord);
        await Db.SaveChangesAsync();

        response = await _client.GetAsync("/finance-records/stats?type=Expense");
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<FinanceRecordsStats>>();
        apiResponse?.Items[0].Should().BeEquivalentTo(s_emptyStats);
    }

    [Fact]
    public async Task ExcludesRecordsCreatedByOtherUsers()
    {
        var otherUser = await UserUtils.RegisterUserAsync(_client);
        var otherRecord = CreateRecordWithAmountAndType(1, FinanceRecordType.Revenue, otherUser.Id);

        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var ownRecord = CreateRecordWithAmountAndType(2, FinanceRecordType.Expense, loginResponse.User.Id);

        await Db.AddRangeAsync(otherRecord, ownRecord);
        await Db.SaveChangesAsync();

        var response = await _client.GetAsync("/finance-records/stats");
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var apiResponse = await response
            .Content
            .ReadFromJsonAsync<ApiResponse<FinanceRecordsStats>>();

        apiResponse?.Items[0].Should().BeEquivalentTo(new FinanceRecordsStats
        {
            ExpenseRecords = 1,
            TotalExpenses = ownRecord.Amount
        });
    }
}
