using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Endpoints;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Validators;
using Okane.Api.Infrastructure.Database.Constants;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Constants;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Finances.Endpoints;

public class PatchFinanceRecordTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    private static readonly PatchFinanceRecord.Request s_validRequest = new(
        100,
        "Groceries",
        DateTime.UtcNow,
        null,
        FinanceRecordType.Expense
    );

    public static TheoryData<PatchFinanceRecord.Request> ValidUpdateRequests => new()
    {
        s_validRequest with { Amount = 200 },
        s_validRequest with { Description = "Updated Groceries" },
        s_validRequest with { HappenedAt = DateTime.UtcNow.AddDays(1) },
        s_validRequest with { Type = FinanceRecordType.Revenue }
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
        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);
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
    public async Task DoesNotUpdateTags_WhenTagIdsIsEmpty()
    {
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var userTags = FinanceTagUtils.AddFinanceUserTags(Db, tags, loginResponse.User.Id);

        var financeRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        financeRecord.Tags = tags;
        Db.Add(financeRecord);
        await Db.SaveChangesAsync();

        var patchResponse = await _client.PatchAsJsonAsync(
            $"/finance-records/{financeRecord.Id}",
            s_validRequest
        );
        patchResponse.Should().HaveStatusCode(HttpStatusCode.OK);

        var financeRecordTags = await Db.FinanceRecordTags.ToListAsync();
        financeRecordTags.Should()
            .ContainSingle(frt => frt.FinanceRecordId == financeRecord.Id && frt.TagId == tags[0].Id);
    }

    [Fact]
    public async Task RemovesAllTags_WhenTagIdsIsEmpty()
    {
        // Arrange.
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 2);
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var userTags = FinanceTagUtils.AddFinanceUserTags(
            Db, tags, loginResponse.User.Id, FinanceRecordType.Revenue
        );
        Db.AddRange(userTags);

        var financeRecord1 = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        financeRecord1.Tags = tags;
        financeRecord1.Type = FinanceRecordType.Revenue;

        // Use to check that tags are only removed from the modified finance record.
        var financeRecord2 = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        financeRecord2.Tags = tags;
        financeRecord2.Type = FinanceRecordType.Revenue;

        Db.AddRange(financeRecord1, financeRecord2);
        await Db.SaveChangesAsync();

        // Act.
        var patchResponse = await _client.PatchAsJsonAsync(
            $"/finance-records/{financeRecord1.Id}",
            s_validRequest with { TagIds = [] }
        );
        patchResponse.Should().HaveStatusCode(HttpStatusCode.OK);

        var financeRecordTags = await Db.FinanceRecordTags.ToListAsync();
        financeRecordTags.Should()
            .OnlyContain(frt => frt.FinanceRecordId == financeRecord2.Id)
            .And.HaveCount(tags.Count);
    }

    [Fact]
    public async Task AddsNewTagsAndRemovesExcludedTags()
    {
        // Arrange.
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 3);
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var userTags = FinanceTagUtils.AddFinanceUserTags(
            Db, tags, loginResponse.User.Id, FinanceRecordType.Revenue
        );
        Db.AddRange(userTags);

        var financeRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        financeRecord.Tags = [tags[0], tags[1]];
        financeRecord.Type = FinanceRecordType.Revenue;
        Db.AddRange(financeRecord);
        await Db.SaveChangesAsync();

        // Act.
        var patchResponse = await _client.PatchAsJsonAsync(
            $"/finance-records/{financeRecord.Id}",
            s_validRequest with { TagIds = [tags[1].Id, tags[2].Id] }
        );
        patchResponse.Should().HaveStatusCode(HttpStatusCode.OK);

        var tagIds = await Db.FinanceRecordTags
            .Select(frt => frt.TagId)
            .ToListAsync();
        tagIds.Should().BeEquivalentTo([tags[1].Id, tags[2].Id]);
    }

    // Validation.
    public static TheoryData<PatchFinanceRecord.Request> InvalidRequests => new()
    {
        s_validRequest with { Amount = -1 },
        s_validRequest with { Amount = 0 },
        s_validRequest with { Amount = (decimal)0.001 },
        s_validRequest with { Amount = 10_000_000 },
        s_validRequest with { Description = "" },
        s_validRequest with { Description = new string('a', DbConstants.MaxStringLength + 1) }
    };

    [Theory]
    [MemberData(nameof(InvalidRequests))]
    public async Task ReturnsAnError_WithAnInvalidRequest(PatchFinanceRecord.Request request)
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var financeRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        await Db.AddAsync(financeRecord);
        await Db.SaveChangesAsync();

        var response = await _client.PatchAsJsonAsync(
            $"/finance-records/{financeRecord.Id}",
            request
        );
        response.Should().HaveStatusCode(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problemDetails?.Status.Should().Be(StatusCodes.Status400BadRequest);
        problemDetails?.Title.Should().Be(ValidationConstants.ValidationErrorTitle);
    }

    [Fact]
    public async Task ReturnsAnError_WithAnInvalidType()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var financeRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        await Db.AddAsync(financeRecord);
        await Db.SaveChangesAsync();

        var response = await _client.PatchAsJsonAsync(
            $"/finance-records/{financeRecord.Id}",
            new { Type = "invalidType" });
        response.Should().HaveStatusCode(HttpStatusCode.BadRequest);
    }

    private static async Task AssertTagsValidationErrorAsync(HttpResponseMessage response)
    {
        response.Should().HaveStatusCode(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();

        problemDetails?.Status.Should().Be(StatusCodes.Status400BadRequest);
        problemDetails?.Title.Should().Be(ValidationConstants.ValidationErrorTitle);
        problemDetails?.Errors.Should().ContainKey("Tags");
        problemDetails?.Errors["Tags"].Should().ContainSingle(FinanceRecordValidator.InvalidTagsMessage);
    }

    [Fact]
    public async Task ReturnsAnError_WhenTryingToAddATagWithoutAnyFinanceUserTags()
    {
        // Arrange.
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var financeRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        Db.Add(financeRecord);
        await Db.SaveChangesAsync();

        // Act.
        var request = s_validRequest with { TagIds = [tags[0].Id] };
        var response = await _client.PatchAsJsonAsync(
            $"/finance-records/{financeRecord.Id}",
            request
        );

        await AssertTagsValidationErrorAsync(response);
    }

    [Fact]
    public async Task ReturnsAnError_WhenFinanceUserTagWithDifferentTypeExists()
    {
        // Arrange.
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var financeUserTags = FinanceTagUtils.AddFinanceUserTags(
            Db, tags, loginResponse.User.Id, FinanceRecordType.Revenue
        );
        Db.AddRange(financeUserTags);

        var financeRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        financeRecord.Type = FinanceRecordType.Expense;
        Db.Add(financeRecord);
        await Db.SaveChangesAsync();

        // Act.
        var request = s_validRequest with { TagIds = tags.Select(t => t.Id).ToArray() };
        var response = await _client.PatchAsJsonAsync(
            $"/finance-records/{financeRecord.Id}",
            request
        );
        await AssertTagsValidationErrorAsync(response);
    }

    [Fact]
    public async Task ReturnsAnError_WhenSomeTagsHaveNoCorrespondingFinanceUserTag()
    {
        // Arrange.
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 2);
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var financeUserTags = FinanceTagUtils.AddFinanceUserTags(
            Db, [tags[0]], loginResponse.User.Id, FinanceRecordType.Revenue
        );
        Db.AddRange(financeUserTags);
        await Db.SaveChangesAsync();

        var financeRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        financeRecord.Type = FinanceRecordType.Revenue;
        Db.Add(financeRecord);
        await Db.SaveChangesAsync();

        // Act.
        var request = s_validRequest with { TagIds = tags.Select(t => t.Id).ToArray() };
        var response = await _client.PatchAsJsonAsync(
            $"/finance-records/{financeRecord.Id}",
            request
        );
        await AssertTagsValidationErrorAsync(response);
    }

    [Fact]
    public async Task ReturnsAnError_WhenFinanceUserTagsWereCreatedByADifferentUser()
    {
        // Arrange.
        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);
        var financeUserTags = FinanceTagUtils.AddFinanceUserTags(
            Db, tags, otherUser.Id, FinanceRecordType.Revenue
        );

        Db.AddRange(financeUserTags);
        await Db.SaveChangesAsync();

        var loginResponse = await _client.RegisterAndLogInTestUserAsync();

        var financeRecord = FinanceRecordStubFactory.Create(loginResponse.User.Id);
        financeRecord.Type = FinanceRecordType.Revenue;
        Db.Add(financeRecord);
        await Db.SaveChangesAsync();

        // Act.
        var request = s_validRequest with { TagIds = tags.Select(t => t.Id).ToArray() };
        var response = await _client.PatchAsJsonAsync(
            $"/finance-records/{financeRecord.Id}",
            request
        );
        await AssertTagsValidationErrorAsync(response);
    }

    // 404.
    [Fact]
    public async Task ReturnsA404_WhenFinanceRecordDoesNotExist()
    {
        await _client.RegisterAndLogInTestUserAsync();
        var patchResponse = await _client.PatchAsJsonAsync(
            $"/finance-records/{Guid.NewGuid()}",
            s_validRequest
        );
        patchResponse.Should().HaveStatusCode(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ReturnsA404_WhenEditingFinanceRecordForOtherUser()
    {
        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);
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
