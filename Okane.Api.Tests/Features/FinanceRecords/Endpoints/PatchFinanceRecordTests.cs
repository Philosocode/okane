using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.FinanceRecords.Endpoints;

public class PatchFinanceRecordTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    private static readonly PatchFinanceRecord.Request s_validRequest = new(
        100,
        "Groceries",
        DateTime.UtcNow
    );

    public static TheoryData<PatchFinanceRecord.Request> ValidUpdateRequests => new()
    {
        s_validRequest with { Amount = 200 },
        s_validRequest with { Description = "Updated Groceries" },
        s_validRequest with { HappenedAt = DateTime.UtcNow.AddDays(1) }
    };

    [Theory]
    [MemberData(nameof(ValidUpdateRequests))]
    public async Task UpdatesAFinanceRecord(PatchFinanceRecord.Request request)
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var financeRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        await Db.AddAsync(financeRecord);
        await Db.SaveChangesAsync();

        var patchResponse = await _client.PatchAsJsonAsync(
            $"finance-records/{financeRecord.Id}", request
        );
        patchResponse.Should().HaveStatusCode(HttpStatusCode.OK);

        var updatedRecord = await patchResponse.Content.ReadFromJsonAsync<ApiResponse<FinanceRecordResponse>>();
        updatedRecord.Should().BeEquivalentTo(request, options => options.ExcludingMissingMembers());
    }

    [Fact]
    public async Task DoesNotUpdateOtherFinanceRecords()
    {
        var otherUser = await UserUtils.RegisterUserAsync(_client);
        var otherRecord = FinanceRecordStubFactory.Create(otherUser.Id);
        await Db.AddAsync(otherRecord);

        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var financeRecord1 = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        var financeRecord2 = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        await Db.AddAsync(financeRecord1);
        await Db.AddAsync(financeRecord2);

        await Db.SaveChangesAsync();

        var patchResponse = await _client.PatchAsJsonAsync(
            $"/finance-records/{financeRecord1.Id}",
            s_validRequest
        );
        patchResponse.Should().HaveStatusCode(HttpStatusCode.OK);

        var otherRecordFromDb = await Db.FinanceRecords.SingleAsync(r => r.Id == otherRecord.Id);
        otherRecordFromDb.Should().BeEquivalentTo(otherRecord);

        var financeRecord2FromDb = await Db.FinanceRecords.SingleAsync(r => r.Id == financeRecord2.Id);
        financeRecord2FromDb.Should().BeEquivalentTo(financeRecord2);
    }

    [Fact]
    public async Task ReturnsA404_WhenFinanceRecordDoesNotExist()
    {
        await _client.RegisterAndLogInTestUserAsync();
        var patchResponse = await _client.PatchAsJsonAsync(
            $"/finance-records/{Guid.NewGuid}",
            s_validRequest
        );
        patchResponse.Should().HaveStatusCode(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ReturnsA404_WhenEditingFinanceRecordForOtherUser()
    {
        var otherUser = await UserUtils.RegisterUserAsync(_client);
        var financeRecord = FinanceRecordStubFactory.Create(otherUser.Id);

        await Db.AddAsync(financeRecord);
        await Db.SaveChangesAsync();

        await _client.RegisterAndLogInTestUserAsync();
        var patchResponse = await _client.PatchAsJsonAsync(
            $"finance-records/{financeRecord.Id}",
            s_validRequest
        );
        patchResponse.Should().HaveStatusCode(HttpStatusCode.NotFound);
    }
}
