using System.Net;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Finances.Endpoints;

public class DeleteFinanceUserTagTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    [Fact]
    public async Task ReturnsOk_AndDeletesAllRelevantTags()
    {
        // Create users.
        var authResponse = await _client.RegisterAndLogInTestUserAsync();
        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);

        // Create tags.
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 2);

        // Create two own finance user tags.
        var ownUserTags = FinanceTagUtils.AddFinanceUserTags(Db, tags, authResponse.User.Id);

        // Create three own finance records.
        var ownFinanceRecords = new List<FinanceRecord>();
        for (var i = 0; i < 3; i++)
        {
            var financeRecordToCreate = FinanceRecordStubFactory.Create(authResponse.User.Id);
            financeRecordToCreate.Tags = tags;
            ownFinanceRecords.Add(financeRecordToCreate);
        }

        Db.AddRange(ownFinanceRecords);

        // The last finance record's type is different from userTagToDelete's type, so its tags should
        // be unaffected.
        ownFinanceRecords[0].Type = FinanceRecordType.Expense;
        ownFinanceRecords[1].Type = FinanceRecordType.Expense;
        ownFinanceRecords[2].Type = FinanceRecordType.Revenue;

        // Set up finance user tags and finance record for a different user. This is done to check
        // that data for other users is unaffected.
        var otherUserTags = FinanceTagUtils.AddFinanceUserTags(Db, tags, otherUser.Id);
        var otherFinanceRecord = FinanceRecordStubFactory.Create(otherUser.Id);
        otherFinanceRecord.Tags = tags;

        Db.AddRange(otherUserTags);
        Db.Add(otherFinanceRecord);

        await Db.SaveChangesAsync();

        // Act.
        var response = await _client.DeleteAsync($"/finance-user-tags/{ownUserTags[0].Id}");

        // Assert.
        response.Should().HaveStatusCode(HttpStatusCode.NoContent);

        // Deletes the appropriate user tags.
        var allUserTags = await Db.FinanceUserTags.ToListAsync();
        allUserTags.Should()
            .NotContain(fut => fut.Id == ownUserTags[0].Id)
            .And.ContainSingle(fut => fut.Id == ownUserTags[1].Id)
            .And.ContainSingle(fut => fut.Id == otherUserTags[0].Id)
            .And.ContainSingle(fut => fut.Id == otherUserTags[1].Id);

        // Before:
        // FR1: tag 1, tag 2, Expense
        // FR2: tag 1, tag 2, Expense
        // FR3: tag 1, tag 2, Revenue
        //
        // After:
        // FR 1: tag 2, Expense
        // FR 2: tag 2, Expense
        // FR 3: tag 1, tag 2, Revenue
        for (var i = 0; i < 2; i++)
        {
            var tagIds = Db.FinanceRecordTags
                .Where(frt => frt.FinanceRecordId == ownFinanceRecords[i].Id)
                .Select(frt => frt.TagId);
            tagIds.Should().BeEquivalentTo([tags[1].Id]);
        }

        var unaffectedTagIds = Db.FinanceRecordTags
            .Where(frt => frt.FinanceRecordId == ownFinanceRecords[2].Id)
            .Select(frt => frt.TagId);
        unaffectedTagIds.Should().BeEquivalentTo(tags.Select(t => t.Id));

        var otherTagIds = Db.FinanceRecordTags
            .Where(frt => frt.FinanceRecordId == otherFinanceRecord.Id)
            .Select(frt => frt.TagId);
        otherTagIds.Should().BeEquivalentTo(tags.Select(t => t.Id));
    }

    [Fact]
    public async Task Returns404_WhenUserTagDoesNotExist()
    {
        // Arrange.
        await _client.RegisterAndLogInTestUserAsync();

        // Act.
        var response = await _client.DeleteAsync("/finance-user-tags/1");

        // Assert.
        response.Should().HaveStatusCode(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Returns404_WhenUserTagCreatedByAnotherUser()
    {
        // Arrange.
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);
        var otherUserTags = FinanceTagUtils.AddFinanceUserTags(Db, tags, otherUser.Id);
        await Db.SaveChangesAsync();

        await _client.RegisterAndLogInTestUserAsync();

        // Act.
        var response = await _client.DeleteAsync($"/finance-user-tags/{otherUserTags[0].Id}");

        // Assert.
        response.Should().HaveStatusCode(HttpStatusCode.NotFound);
    }
}
