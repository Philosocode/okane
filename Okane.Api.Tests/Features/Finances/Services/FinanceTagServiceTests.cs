using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Services;
using Okane.Api.Features.Tags.Entities;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Finances.Services;

public class FinanceTagServiceTests
{
    public class CreateFinanceUserTagAsync : DatabaseTest
    {
        private readonly HttpClient _client;
        private readonly IFinanceTagService _financeTagService;

        public CreateFinanceUserTagAsync(PostgresApiFactory apiFactory) : base(apiFactory)
        {
            _client = apiFactory.CreateClient();
            _financeTagService = new FinanceTagService(Db);
        }

        [Fact]
        public async Task CreatesATagAndUserTag()
        {
            var authResponse = await _client.RegisterAndLogInTestUserAsync();
            var userTag = await _financeTagService.CreateFinanceUserTagAsync(
                "a",
                FinanceRecordType.Revenue,
                authResponse.User.Id,
                CancellationToken.None
            );

            var dbUserTags = await Db.FinanceUserTags.ToListAsync();
            dbUserTags.Should().ContainSingle(fut => fut.Id == userTag.Id);

            var dbTags = await Db.Tags.ToListAsync();
            dbTags.Should().ContainSingle(t => t.Name == "a");
        }

        [Fact]
        public async Task DoesNotCreateATag_WhenTagAlreadyExists()
        {
            var authResponse = await _client.RegisterAndLogInTestUserAsync();
            var tag = new Tag { Name = "a" };
            Db.Add(tag);
            await Db.SaveChangesAsync();

            await _financeTagService.CreateFinanceUserTagAsync(
                tag.Name,
                FinanceRecordType.Revenue,
                authResponse.User.Id,
                CancellationToken.None
            );

            var dbTags = await Db.Tags.ToListAsync();
            dbTags.Should().ContainSingle(t => t.Id == tag.Id);
        }
    }

    public class SyncFinanceRecordTagsAsync : DatabaseTest
    {
        private readonly HttpClient _client;
        private readonly IFinanceTagService _financeTagService;

        public SyncFinanceRecordTagsAsync(PostgresApiFactory apiFactory) : base(apiFactory)
        {
            _client = apiFactory.CreateClient();
            _financeTagService = new FinanceTagService(Db);
        }

        [Fact]
        public async Task AddsNewTagsAndRemovesExcludedTags()
        {
            var authResponse = await _client.RegisterAndLogInTestUserAsync();
            var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 3);

            var financeRecord = FinanceRecordStubFactory.Create(authResponse.User.Id);
            financeRecord.Tags.Add(tags[0]);
            financeRecord.Tags.Add(tags[1]);
            Db.Add(financeRecord);
            await Db.SaveChangesAsync();

            List<int> desiredTagIds = [tags[1].Id, tags[2].Id];

            await _financeTagService.SyncFinanceRecordTagsAsync(
                desiredTagIds, financeRecord, CancellationToken.None
            );

            var dbTagIds = await Db.FinanceRecordTags.Select(frt => frt.TagId).ToListAsync();
            dbTagIds.Should().BeEquivalentTo(desiredTagIds);
        }

        [Fact]
        public async Task RemovesAllFinanceRecordTags_WhenTagIdsIsEmpty()
        {
            var authResponse = await _client.RegisterAndLogInTestUserAsync();
            var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 2);
            var financeRecord = FinanceRecordStubFactory.Create(authResponse.User.Id);
            financeRecord.Tags = tags;
            Db.Add(financeRecord);
            await Db.SaveChangesAsync();

            await _financeTagService.SyncFinanceRecordTagsAsync([], financeRecord, CancellationToken.None);

            var dbFinanceRecordTags = await Db.FinanceRecordTags.ToListAsync();
            dbFinanceRecordTags.Should().BeNullOrEmpty();
        }

        [Fact]
        public async Task DoesNotUpdateTagsForOtherFinanceRecords()
        {
            var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
            var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);
            var authResponse = await _client.RegisterAndLogInTestUserAsync();
            var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);

            var financeRecord1 = FinanceRecordStubFactory.Create(authResponse.User.Id);
            financeRecord1.Tags = [tags[0]];
            var financeRecord2 = FinanceRecordStubFactory.Create(authResponse.User.Id);
            financeRecord2.Tags = [tags[0]];
            var otherFinanceRecord = FinanceRecordStubFactory.Create(otherUser.Id);
            otherFinanceRecord.Tags = [tags[0]];

            Db.AddRange(financeRecord1, financeRecord2, otherFinanceRecord);
            await Db.SaveChangesAsync();

            await _financeTagService.SyncFinanceRecordTagsAsync([], financeRecord1, CancellationToken.None);
            var dbFinanceRecordTags = await Db.FinanceRecordTags.ToListAsync();
            dbFinanceRecordTags.Should().HaveCount(2)
                .And.ContainSingle(
                    frt => frt.TagId == tags[0].Id && frt.FinanceRecordId == financeRecord2.Id
                )
                .And.ContainSingle(
                    frt => frt.TagId == tags[0].Id && frt.FinanceRecordId == otherFinanceRecord.Id
                );
        }
    }

    public class ValidateRequestTagsAsync : DatabaseTest
    {
        private readonly HttpClient _client;
        private readonly IFinanceTagService _financeTagService;

        public ValidateRequestTagsAsync(PostgresApiFactory apiFactory) : base(apiFactory)
        {
            _client = apiFactory.CreateClient();
            _financeTagService = new FinanceTagService(Db);
        }

        [Fact]
        public async Task ReturnsTrue_WhenTagIdsIsEmpty()
        {
            var authResponse = await _client.RegisterAndLogInTestUserAsync();
            var isValid = await _financeTagService.ValidateRequestTagsAsync(
                [],
                FinanceRecordType.Expense,
                authResponse.User.Id,
                CancellationToken.None
            );
            isValid.Should().BeTrue();
        }

        [Fact]
        public async Task ReturnsTrue_WhenAllTagsHaveAnAssociatedUserTag()
        {
            var authResponse = await _client.RegisterAndLogInTestUserAsync();
            var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 3);
            var userTags = FinanceTagUtils.AddFinanceUserTags(
                Db,
                tags,
                authResponse.User.Id,
                FinanceRecordType.Revenue
            );
            Db.AddRange(userTags);
            await Db.SaveChangesAsync();

            var isValid = await _financeTagService.ValidateRequestTagsAsync(
                tags.Select(t => t.Id).ToList(),
                FinanceRecordType.Revenue,
                authResponse.User.Id,
                CancellationToken.None
            );
            isValid.Should().BeTrue();
        }

        [Fact]
        public async Task ReturnsFalse_WhenTagHasNoAssociatedUserTag()
        {
            var authResponse = await _client.RegisterAndLogInTestUserAsync();
            var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 3);
            var userTags = FinanceTagUtils.AddFinanceUserTags(
                Db,
                [tags[0], tags[1]],
                authResponse.User.Id,
                FinanceRecordType.Revenue
            );
            Db.AddRange(userTags);
            await Db.SaveChangesAsync();

            var isValid = await _financeTagService.ValidateRequestTagsAsync(
                [tags[0].Id, tags[2].Id],
                FinanceRecordType.Revenue,
                authResponse.User.Id,
                CancellationToken.None
            );
            isValid.Should().BeFalse();
        }

        [Fact]
        public async Task ReturnsFalse_WhenUserTagWasCreatedByAnotherUser()
        {
            var authResponse = await _client.RegisterAndLogInTestUserAsync();
            var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
            var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);

            var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, 1);
            var userTags = FinanceTagUtils.AddFinanceUserTags(
                Db,
                tags,
                otherUser.Id,
                FinanceRecordType.Revenue
            );
            Db.AddRange(userTags);
            await Db.SaveChangesAsync();

            var isValid = await _financeTagService.ValidateRequestTagsAsync(
                [tags[0].Id],
                FinanceRecordType.Revenue,
                authResponse.User.Id,
                CancellationToken.None
            );
            isValid.Should().BeFalse();
        }
    }
}
