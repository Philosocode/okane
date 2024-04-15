using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Mappers;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.FinanceRecords.Endpoints;

public class GetFinanceRecordTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    [Fact]
    public async Task ReturnsAFinanceRecord_WhenItExists()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var financeRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);

        await Db.FinanceRecords.AddAsync(financeRecord);
        await Db.SaveChangesAsync();

        var response = await _client.GetAsync($"/finance-records/{financeRecord.Id}");
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<ApiResponse<FinanceRecordResponse>>();
        content?.Items.Should()
            .ContainSingle()
            .Which.Should().BeEquivalentTo(financeRecord.ToFinanceRecordResponse());
    }

    [Fact]
    public async Task ReturnsANotFound_WhenRecordDoesNotExist()
    {
        var response = await _client.GetAsync($"/finance-records/{Guid.NewGuid()}");
        response.Should().HaveStatusCode(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ReturnsANotFound_WhenRecordCreatedByDifferentUser()
    {
        var otherUser = await UserUtils.RegisterUserAsync(_client);
        var financeRecord = FinanceRecordStubFactory.Create(otherUser.Id);

        await Db.FinanceRecords.AddAsync(financeRecord);
        await Db.SaveChangesAsync();

        await _client.RegisterAndLogInTestUserAsync();

        var response = await _client.GetAsync($"/finance-records/{financeRecord.Id}");
        response.Should().HaveStatusCode(HttpStatusCode.NotFound);
    }
}
