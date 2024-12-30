using System.Net;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Finances.Endpoints;

public class DeleteFinanceRecordTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    [Fact]
    public async Task DeletesAFinanceRecordAndTags()
    {
        // Setup.
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();

        var tags = TagStubFactory.CreateN(2);
        var financeRecord1 = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        financeRecord1.Tags = tags;
        var financeRecord2 = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        financeRecord2.Tags = tags;

        Db.AddRange(financeRecord1, financeRecord2);
        await Db.SaveChangesAsync();

        var deleteResponse = await _client.DeleteAsync($"finance-records/{financeRecord1.Id}");
        deleteResponse.Should().HaveStatusCode(HttpStatusCode.NoContent);

        var remainingFinanceRecords = await Db.FinanceRecords.ToListAsync();
        remainingFinanceRecords.Should().HaveCount(1);
        remainingFinanceRecords[0].Id.Should().Be(financeRecord2.Id);

        var remainingFinanceRecordTags = await Db.FinanceRecordTags.ToListAsync();
        remainingFinanceRecordTags.Should()
            .HaveCount(tags.Count)
            .And.NotContain(frt => frt.FinanceRecordId == financeRecord1.Id);
    }

    [Fact]
    public async Task ReturnsA404_ForNonExistentFinanceRecord()
    {
        await _client.RegisterAndLogInTestUserAsync();
        var deleteResponse = await _client.DeleteAsync($"/finance-records/{Guid.NewGuid()}");
        deleteResponse.Should().HaveStatusCode(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DoesNotDeleteFinanceRecordsForOtherUsers()
    {
        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);
        var otherFinanceRecord = FinanceRecordStubFactory.Create(otherUser.Id);
        await Db.AddAsync(otherFinanceRecord);

        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var ownFinanceRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        await Db.AddAsync(ownFinanceRecord);

        await Db.SaveChangesAsync();

        var deleteResponse = await _client.DeleteAsync($"finance-records/{ownFinanceRecord.Id}");
        deleteResponse.Should().HaveStatusCode(HttpStatusCode.NoContent);

        var remainingFinanceRecords = await Db.FinanceRecords.ToListAsync();
        remainingFinanceRecords.Should().ContainSingle(r => r.Id == otherFinanceRecord.Id);

        deleteResponse = await _client.DeleteAsync($"finance-records/{otherFinanceRecord.Id}");
        deleteResponse.Should().HaveStatusCode(HttpStatusCode.NotFound);
    }
}
