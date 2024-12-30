using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Endpoints;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Tags.Entities;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Finances.Endpoints;

public class PostRenameFinanceUserTagTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    private static readonly PostRenameFinanceUserTag.Request s_validRequest = new("updated-name");

    [Fact]
    public async Task ReplacesTheUserTagAndCreatesANewTag()
    {
        var authResponse = await _client.RegisterAndLogInTestUserAsync();
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
        var userTag = FinanceTagUtils.AddFinanceUserTags(Db, tags, authResponse.User.Id)[0];
        Db.Add(userTag);
        await Db.SaveChangesAsync();

        var response = await _client.PostAsJsonAsync(
            $"finance-user-tags/{userTag.Id}/rename",
            s_validRequest
        );
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var jsonResponse = await response
            .Content
            .ReadFromJsonAsync<ApiResponse<FinanceUserTagResponse>>();
        var newUserTag = jsonResponse?.Items[0];
        newUserTag?.Tag.Name.Should().Be(s_validRequest.Name);

        var dbUserTags = await Db.FinanceUserTags.ToListAsync();
        dbUserTags.Should().ContainSingle(fut => fut.Id == newUserTag!.Id);

        var dbTags = await Db.Tags.ToListAsync();
        dbTags.Should().HaveCount(2); // Existing tag + new one.
        dbTags.Should()
            .Contain(t => t.Id == tags[0].Id)
            .And.Contain(t => t.Name == s_validRequest.Name);
    }

    [Fact]
    public async Task DoesNotCreateANewTag_IfTagWithUpdatedNameAlreadyExists()
    {
        var authResponse = await _client.RegisterAndLogInTestUserAsync();
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 2);
        tags[1].Name = s_validRequest.Name;

        var userTag = FinanceTagUtils.AddFinanceUserTags(Db, [tags[0]], authResponse.User.Id)[0];
        Db.Add(userTag);
        await Db.SaveChangesAsync();

        var response = await _client.PostAsJsonAsync(
            $"finance-user-tags/{userTag.Id}/rename",
            s_validRequest
        );
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var dbTags = await Db.Tags.ToListAsync();
        dbTags.Should().BeEquivalentTo(tags);
    }

    [Fact]
    public async Task DoesNotCreateANewUserTag_IfUserTagWithUpdatedNameAlreadyExists()
    {
        var authResponse = await _client.RegisterAndLogInTestUserAsync();
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 2);
        tags[1].Name = s_validRequest.Name;

        var userTags = FinanceTagUtils.AddFinanceUserTags(Db, tags, authResponse.User.Id);
        Db.AddRange(userTags);
        await Db.SaveChangesAsync();

        var response = await _client.PostAsJsonAsync(
            $"finance-user-tags/{userTags[0].Id}/rename",
            s_validRequest
        );
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var jsonResponse = await response
            .Content
            .ReadFromJsonAsync<ApiResponse<FinanceUserTagResponse>>();
        var newUserTag = jsonResponse?.Items[0];
        newUserTag?.Id.Should().Be(userTags[1].Id);
    }

    [Fact]
    public async Task SyncsFinanceRecordTags()
    {
        var authResponse = await _client.RegisterAndLogInTestUserAsync();
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
        var userTags = FinanceTagUtils.AddFinanceUserTags(
            Db, tags, authResponse.User.Id, FinanceRecordType.Revenue
        );
        Db.AddRange(userTags);

        var financeRecords = new List<FinanceRecord>();
        for (var i = 0; i < 3; i++)
        {
            financeRecords.Add(FinanceRecordStubFactory.Create(authResponse.User.Id));
            financeRecords[i].Type = FinanceRecordType.Revenue;
            financeRecords[i].Tags = tags;
        }

        Db.AddRange(financeRecords);
        await Db.SaveChangesAsync();

        var response = await _client.PostAsJsonAsync(
            $"finance-user-tags/{userTags[0].Id}/rename",
            s_validRequest
        );
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var jsonResponse = await response
            .Content
            .ReadFromJsonAsync<ApiResponse<FinanceUserTagResponse>>();
        var newUserTag = jsonResponse!.Items[0];

        var financeRecordTags = await Db.FinanceRecordTags.ToListAsync();
        financeRecordTags.Should()
            .HaveCount(financeRecords.Count)
            .And.OnlyContain(frt => frt.TagId == newUserTag.Tag.Id);
    }

    [Fact]
    public async Task DoesNotUpdateIrrelevantFinanceRecordTags()
    {
        var authResponse = await _client.RegisterAndLogInTestUserAsync();
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 2);
        var userTags = FinanceTagUtils.AddFinanceUserTags(
            Db, tags, authResponse.User.Id, FinanceRecordType.Revenue
        );
        Db.AddRange(userTags);

        var financeRecordDifferentType = FinanceRecordStubFactory.Create(authResponse.User.Id);
        financeRecordDifferentType.Tags = [tags[0]];
        financeRecordDifferentType.Type = FinanceRecordType.Expense;

        var financeRecordDifferentTags = FinanceRecordStubFactory.Create(authResponse.User.Id);
        financeRecordDifferentTags.Tags = [tags[1]];
        financeRecordDifferentTags.Type = FinanceRecordType.Revenue;

        Db.AddRange(financeRecordDifferentType, financeRecordDifferentTags);
        await Db.SaveChangesAsync();

        var response = await _client.PostAsJsonAsync(
            $"finance-user-tags/{userTags[0].Id}/rename",
            s_validRequest
        );
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var financeRecordTags = await Db.FinanceRecordTags.ToListAsync();
        financeRecordTags.Should()
            .HaveCount(2)
            .And.ContainSingle(
                frt => frt.TagId == tags[0].Id && frt.FinanceRecordId == financeRecordDifferentType.Id
            )
            .And.ContainSingle(
                frt => frt.TagId == tags[1].Id && frt.FinanceRecordId == financeRecordDifferentTags.Id
            );
    }

    [Fact]
    public async Task DoesNotUpdateDataForOtherUsers()
    {
        var authResponse = await _client.RegisterAndLogInTestUserAsync();
        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);

        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
        var ownUserTags = FinanceTagUtils.AddFinanceUserTags(
            Db, tags, authResponse.User.Id, FinanceRecordType.Revenue
        );
        Db.AddRange(ownUserTags);

        // User tags created by other users shouldn't be replaced.
        var otherUserTags = FinanceTagUtils.AddFinanceUserTags(
            Db, tags, otherUser.Id, FinanceRecordType.Revenue
        );
        Db.AddRange(otherUserTags);

        // Finance record tags created by other users shouldn't be replaced.
        var otherFinanceRecord = FinanceRecordStubFactory.Create(otherUser.Id);
        otherFinanceRecord.Tags = tags;
        otherFinanceRecord.Type = FinanceRecordType.Revenue;

        Db.AddRange(otherFinanceRecord);
        await Db.SaveChangesAsync();

        var response = await _client.PostAsJsonAsync(
            $"finance-user-tags/{ownUserTags[0].Id}/rename",
            s_validRequest
        );
        response.Should().HaveStatusCode(HttpStatusCode.OK);

        var jsonResponse = await response
            .Content
            .ReadFromJsonAsync<ApiResponse<FinanceUserTagResponse>>();
        var newUserTag = jsonResponse!.Items[0];

        var dbUserTags = await Db.FinanceUserTags.ToListAsync();
        dbUserTags.Should().HaveCount(2)
            .And.ContainSingle(
                fut => fut.TagId == tags[0].Id && fut.UserId == otherUser.Id
            )
            .And.ContainSingle(
                fut => fut.TagId == newUserTag.Tag.Id && fut.UserId == authResponse.User.Id
            );

        var dbFinanceRecordTags = await Db.FinanceRecordTags.ToListAsync();
        dbFinanceRecordTags.Should().ContainSingle(
            frt => frt.TagId == tags[0].Id && frt.FinanceRecordId == otherFinanceRecord.Id
        );
    }

    // Validation.
    [Fact]
    public async Task ReturnsAnError_WhenNameUnchanged()
    {
        var authResponse = await _client.RegisterAndLogInTestUserAsync();
        var tag = new Tag { Name = s_validRequest.Name };
        Db.Add(tag);
        await Db.SaveChangesAsync();

        var userTag = FinanceTagUtils.AddFinanceUserTags(Db, [tag], authResponse.User.Id)[0];
        Db.Add(userTag);
        await Db.SaveChangesAsync();

        var response = await _client.PostAsJsonAsync(
            $"finance-user-tags/{userTag.Id}/rename",
            s_validRequest
        );
        response.Should().HaveStatusCode(HttpStatusCode.BadRequest);
    }

    // Not found.
    [Fact]
    public async Task ReturnsNotFound_WhenUserTagToRenameDoesNotExist()
    {
        await _client.RegisterAndLogInTestUserAsync();
        var response = await _client.PostAsJsonAsync("finance-user-tags/1/rename", s_validRequest);
        response.Should().HaveStatusCode(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ReturnsNotFound_WhenUserTagToRenameWasCreatedByAnotherUser()
    {
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);

        var userTags = FinanceTagUtils.AddFinanceUserTags(Db, tags, otherUser.Id);
        Db.AddRange(userTags);
        await Db.SaveChangesAsync();

        await _client.RegisterAndLogInTestUserAsync();

        var response = await _client.PostAsJsonAsync(
            $"finance-user-tags/{userTags[0].Id}/rename",
            s_validRequest
        );
        response.Should().HaveStatusCode(HttpStatusCode.NotFound);
    }
}
