using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Services;
using Okane.Api.Features.Tags.Entities;
using Okane.Api.Tests.Testing.Integration;

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
}
