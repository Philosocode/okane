using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Mappers;
using Okane.Api.Shared.Dtos.ApiResponses;
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
        var otherUser = await UserUtils.RegisterUserAsync(_client);
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
}
