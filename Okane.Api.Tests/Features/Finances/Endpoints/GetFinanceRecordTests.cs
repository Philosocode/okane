using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Tags.Entities;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Finances.Endpoints;

public class GetFinanceRecordTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    [Fact]
    public async Task ReturnsAFinanceRecord_WhenItExists()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var financeRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        financeRecord.Tags =
        [
            new Tag { Name = "b" },
            new Tag { Name = "a" }
        ];

        Db.FinanceRecords.Add(financeRecord);
        await Db.SaveChangesAsync();

        var response = await _client.GetAsync($"/finance-records/{financeRecord.Id}");
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<ApiResponse<FinanceRecordResponse>>();
        content?.Items.Should().ContainSingle();

        var fetchedFinanceRecord = content?.Items.First();
        fetchedFinanceRecord?.Id.Should().Be(financeRecord.Id);
        fetchedFinanceRecord?.Tags.Select(t => t.Name).Should().BeEquivalentTo("a", "b");
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
        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);
        var financeRecord = FinanceRecordStubFactory.Create(otherUser.Id);

        await Db.FinanceRecords.AddAsync(financeRecord);
        await Db.SaveChangesAsync();

        await _client.RegisterAndLogInTestUserAsync();

        var response = await _client.GetAsync($"/finance-records/{financeRecord.Id}");
        response.Should().HaveStatusCode(HttpStatusCode.NotFound);
    }
}
