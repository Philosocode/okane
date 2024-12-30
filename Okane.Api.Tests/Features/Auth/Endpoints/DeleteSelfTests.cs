using System.Net;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class DeleteSelfTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly HttpClient _client = apiFactory.CreateClient();
    private const int NumRecordsPerEntity = 3;

    private async Task<(string userId, string otherUserId)> SetUp()
    {
        // We'll register another user so we can check that their data is NOT affected.
        var otherUserEmail = await UserUtils.RegisterUserAsync(_client);
        var otherUser = await UserUtils.GetByEmailAsync(Db, otherUserEmail);

        var authResponse = await _client.RegisterAndLogInTestUserAsync();

        var tags = await TagUtils.CreateAndSaveNTagsAsync(Db, NumRecordsPerEntity);

        var ownFinanceUserTags = FinanceTagUtils.AddFinanceUserTags(
            Db, tags, authResponse.User.Id
        );
        var otherFinanceUserTags = FinanceTagUtils.AddFinanceUserTags(
            Db, tags, otherUser.Id
        );
        Db.AddRange(ownFinanceUserTags);
        Db.AddRange(otherFinanceUserTags);

        for (var i = 0; i < NumRecordsPerEntity; i++)
        {
            var ownFinanceRecord = FinanceRecordStubFactory.Create(authResponse.User.Id);
            ownFinanceRecord.Tags = tags;

            var otherFinanceRecord = FinanceRecordStubFactory.Create(otherUser.Id);
            otherFinanceRecord.Tags = tags;

            var ownRefreshToken = RefreshTokenStubFactory.Create(authResponse.User.Id);
            var otherRefreshToken = RefreshTokenStubFactory.Create(otherUser.Id);

            Db.AddRange(ownRefreshToken, otherRefreshToken, ownFinanceRecord, otherFinanceRecord);
        }

        await Db.SaveChangesAsync();

        return (authResponse.User.Id, otherUser.Id);
    }

    [Fact]
    public async Task DeletesTheUserAndAssociatedData()
    {
        var (userId, _) = await SetUp();

        var response = await _client.DeleteAsync("/auth/self");
        response.Should().HaveStatusCode(HttpStatusCode.NoContent);

        var ownFinanceUserTags = await Db.FinanceUserTags.Where(fut => fut.UserId == userId).ToListAsync();
        ownFinanceUserTags.Should().BeEmpty();

        var ownFinanceRecordTags = await Db.FinanceRecordTags
            .Include(frt => frt.FinanceRecord)
            .Where(frt => frt.FinanceRecord.UserId == userId)
            .ToListAsync();
        ownFinanceRecordTags.Should().BeEmpty();

        var ownFinanceRecords = await Db.FinanceRecords.Where(fr => fr.UserId == userId).ToListAsync();
        ownFinanceRecords.Should().BeEmpty();

        var ownRefreshTokens = await Db.RefreshTokens.Where(rt => rt.UserId == userId).ToListAsync();
        ownRefreshTokens.Should().BeEmpty();

        var ownUser = await Db.Users.SingleOrDefaultAsync(u => u.Id == userId);
        ownUser.Should().BeNull();
    }

    [Fact]
    public async Task DoesNotDeleteDataForOtherUsers()
    {
        var (_, otherUserId) = await SetUp();

        var response = await _client.DeleteAsync("/auth/self");
        response.Should().HaveStatusCode(HttpStatusCode.NoContent);

        var otherFinanceUserTags = await Db.FinanceUserTags
            .Where(fut => fut.UserId == otherUserId)
            .ToListAsync();
        otherFinanceUserTags.Should().HaveCount(NumRecordsPerEntity);

        var otherFinanceRecordTags = await Db.FinanceRecordTags
            .Include(frt => frt.FinanceRecord)
            .Where(frt => frt.FinanceRecord.UserId == otherUserId)
            .ToListAsync();
        // Each finance record gets NumRecordsPerEntity tags.
        otherFinanceRecordTags.Should().HaveCount(NumRecordsPerEntity * NumRecordsPerEntity);

        var otherFinanceRecords = await Db.FinanceRecords
            .Where(fr => fr.UserId == otherUserId)
            .ToListAsync();
        otherFinanceRecords.Should().HaveCount(NumRecordsPerEntity);

        var otherRefreshTokens = await Db.RefreshTokens
            .Where(rt => rt.UserId == otherUserId)
            .ToListAsync();
        otherRefreshTokens.Should().HaveCount(NumRecordsPerEntity);

        var otherUser = await Db.Users.SingleOrDefaultAsync(u => u.Id == otherUserId);
        otherUser.Should().NotBeNull();
    }
}
