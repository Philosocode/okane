using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Services;
using Okane.Api.Features.Tags.Entities;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Features.Finances.Services;

public class FinanceRecordServiceTests
{
    public class FilterQueryableFinanceRecords : DatabaseTest
    {
        private readonly IFinanceRecordService _financeRecordService;

        public FilterQueryableFinanceRecords(PostgresApiFactory apiFactory) : base(apiFactory)
        {
            _financeRecordService = new FinanceRecordService(Db);
        }

        [Fact]
        public async Task ExcludesFinanceRecordsCreatedByOtherUsers()
        {
            var self = UserUtils.AddApiUser(Db);
            var other = UserUtils.AddApiUser(Db);
            await Db.SaveChangesAsync();

            var otherFinanceRecord = FinanceRecordStubFactory.Create(other.Id);
            var ownFinanceRecord = FinanceRecordStubFactory.Create(self.Id);
            Db.AddRange(otherFinanceRecord, ownFinanceRecord);
            await Db.SaveChangesAsync();

            var financeRecords = await _financeRecordService.FilterQueryableFinanceRecords(
                Db.FinanceRecords.AsNoTracking(),
                new(),
                self.Id
            ).ToListAsync();

            financeRecords.Should().ContainSingle(fr => fr.UserId == self.Id);
        }

        private async Task AssertExpectedFinanceRecords(
            Func<string, IList<FinanceRecord>> getFinanceRecords,
            FinanceRecordFilterQueryParameters queryParameters,
            Func<IList<int>, IList<int>> getExpectedIds)
        {
            var user = UserUtils.AddApiUser(Db);
            await Db.SaveChangesAsync();

            var financeRecords = getFinanceRecords(user.Id);
            Db.AddRange(financeRecords);
            await Db.SaveChangesAsync();

            var allIds = financeRecords.Select(f => f.Id).ToList();

            var filteredRecords = await _financeRecordService
                .FilterQueryableFinanceRecords(Db.FinanceRecords, queryParameters, user.Id)
                .Select(fr => fr.Id)
                .ToListAsync();

            filteredRecords.Should().BeEquivalentTo(getExpectedIds(allIds));
        }

        [Fact]
        public async Task FiltersByDescription_WithSingleSearchTerm()
        {
            FinanceRecord CreateWithDescription(string description, string userId)
            {
                var record = FinanceRecordStubFactory.Create(userId);
                record.Description = description;
                return record;
            }

            IList<FinanceRecord> GetFinanceRecords(string userId)
            {
                return
                [
                    CreateWithDescription("Sir Doggo", userId),
                    CreateWithDescription("Sirloin steak", userId),
                    CreateWithDescription("Yes sir", userId),
                    CreateWithDescription("Yes sirloin", userId),
                    CreateWithDescription("540 720 1080", userId)
                ];
            }

            var queryParams = new FinanceRecordFilterQueryParameters
            {
                Description = "sir"
            };

            IList<int> GetExpectedIds(IList<int> ids)
            {
                return [ids[0], ids[2]];
            }

            await AssertExpectedFinanceRecords(GetFinanceRecords, queryParams, GetExpectedIds);
        }

        [Fact]
        public async Task FiltersByDescription_WithMultipleSearchTerms()
        {
            FinanceRecord CreateWithDescription(string description, string userId)
            {
                var record = FinanceRecordStubFactory.Create(userId);
                record.Description = description;
                return record;
            }

            IList<FinanceRecord> GetFinanceRecords(string userId)
            {
                return
                [
                    CreateWithDescription("Hi bye", userId),
                    CreateWithDescription("Hi apple bye", userId),
                    CreateWithDescription("Hi there", userId),
                    CreateWithDescription("Hey bye", userId),
                    CreateWithDescription("540 720 1080", userId)
                ];
            }

            var queryParams = new FinanceRecordFilterQueryParameters
            {
                Description = "HI bye"
            };

            IList<int> GetExpectedIds(IList<int> ids)
            {
                return [ids[0], ids[1]];
            }

            await AssertExpectedFinanceRecords(GetFinanceRecords, queryParams, GetExpectedIds);
        }

        [Fact]
        public async Task FiltersByHappenedBefore()
        {
            FinanceRecord CreateWithHappenedAt(DateTime happenedAt, string userId)
            {
                var record = FinanceRecordStubFactory.Create(userId);
                record.HappenedAt = happenedAt;
                return record;
            }

            var happenedAt = new DateTime(2024, 10, 10, 10, 10, 10, DateTimeKind.Utc);

            IList<FinanceRecord> GetFinanceRecords(string userId)
            {
                return
                [
                    CreateWithHappenedAt(happenedAt.AddMilliseconds(-1), userId),
                    CreateWithHappenedAt(happenedAt, userId),
                    CreateWithHappenedAt(happenedAt.AddMilliseconds(1), userId)
                ];
            }

            var queryParams = new FinanceRecordFilterQueryParameters
            {
                HappenedBefore = DateTime.Parse("2024-10-10T10:10:10.000Z")
            };

            IList<int> GetExpectedIds(IList<int> ids)
            {
                return [ids[0], ids[1]];
            }

            await AssertExpectedFinanceRecords(GetFinanceRecords, queryParams, GetExpectedIds);
        }

        [Fact]
        public async Task FiltersByHappenedAfter()
        {
            FinanceRecord CreateWithHappenedAt(DateTime happenedAt, string userId)
            {
                var record = FinanceRecordStubFactory.Create(userId);
                record.HappenedAt = happenedAt;
                return record;
            }

            var happenedAt = new DateTime(2024, 10, 10, 10, 10, 10, DateTimeKind.Utc);

            IList<FinanceRecord> GetFinanceRecords(string userId)
            {
                return
                [
                    CreateWithHappenedAt(happenedAt.AddMilliseconds(-1), userId),
                    CreateWithHappenedAt(happenedAt, userId),
                    CreateWithHappenedAt(happenedAt.AddMilliseconds(1), userId)
                ];
            }

            var queryParams = new FinanceRecordFilterQueryParameters
            {
                HappenedAfter = DateTime.Parse("2024-10-10T10:10:10.000Z")
            };

            IList<int> GetExpectedIds(IList<int> ids)
            {
                return [ids[1], ids[2]];
            }

            await AssertExpectedFinanceRecords(GetFinanceRecords, queryParams, GetExpectedIds);
        }

        [Fact]
        public async Task FiltersByMinAmount()
        {
            FinanceRecord CreateWithAmount(decimal amount, string userId)
            {
                var record = FinanceRecordStubFactory.Create(userId);
                record.Amount = amount;
                return record;
            }

            IList<FinanceRecord> GetFinanceRecords(string userId)
            {
                return
                [
                    CreateWithAmount(0.5m, userId),
                    CreateWithAmount(1.49m, userId),
                    CreateWithAmount(1.5m, userId),
                    CreateWithAmount(2m, userId)
                ];
            }

            var queryParams = new FinanceRecordFilterQueryParameters
            {
                MinAmount = 1.5m
            };

            IList<int> GetExpectedIds(IList<int> ids)
            {
                return [ids[2], ids[3]];
            }

            await AssertExpectedFinanceRecords(GetFinanceRecords, queryParams, GetExpectedIds);
        }

        [Fact]
        public async Task FiltersByMaxAmount()
        {
            FinanceRecord CreateWithAmount(decimal amount, string userId)
            {
                var record = FinanceRecordStubFactory.Create(userId);
                record.Amount = amount;
                return record;
            }

            IList<FinanceRecord> GetFinanceRecords(string userId)
            {
                return
                [
                    CreateWithAmount(0.5m, userId),
                    CreateWithAmount(1.49m, userId),
                    CreateWithAmount(1.5m, userId),
                    CreateWithAmount(2m, userId)
                ];
            }

            var queryParams = new FinanceRecordFilterQueryParameters
            {
                MaxAmount = 1.5m
            };

            IList<int> GetExpectedIds(IList<int> ids)
            {
                return [ids[0], ids[1], ids[2]];
            }

            await AssertExpectedFinanceRecords(GetFinanceRecords, queryParams, GetExpectedIds);
        }

        [Fact]
        public async Task FiltersByTagIds()
        {
            var tags = TagStubFactory.CreateN(3);
            Db.AddRange(tags);
            await Db.SaveChangesAsync();

            FinanceRecord CreateWithTags(IList<Tag> tagsToCreateWith, string userId)
            {
                var record = FinanceRecordStubFactory.Create(userId);
                record.Tags = tagsToCreateWith;
                return record;
            }

            IList<FinanceRecord> GetFinanceRecords(string userId)
            {
                return
                [
                    CreateWithTags([tags[0]], userId),
                    CreateWithTags([tags[1]], userId),
                    CreateWithTags([tags[0], tags[1]], userId),
                    CreateWithTags([tags[2]], userId)
                ];
            }

            var queryParams = new FinanceRecordFilterQueryParameters
            {
                TagIds = [tags[0].Id, tags[1].Id]
            };

            IList<int> GetExpectedIds(IList<int> ids)
            {
                return [ids[0], ids[1], ids[2]];
            }

            await AssertExpectedFinanceRecords(GetFinanceRecords, queryParams, GetExpectedIds);
        }

        [Fact]
        public async Task FiltersByType()
        {
            FinanceRecord CreateWithType(FinanceRecordType type, string userId)
            {
                var record = FinanceRecordStubFactory.Create(userId);
                record.Type = type;
                return record;
            }

            IList<FinanceRecord> GetFinanceRecords(string userId)
            {
                return
                [
                    CreateWithType(FinanceRecordType.Expense, userId),
                    CreateWithType(FinanceRecordType.Revenue, userId),
                    CreateWithType(FinanceRecordType.Expense, userId),
                    CreateWithType(FinanceRecordType.Revenue, userId)
                ];
            }

            var queryParams = new FinanceRecordFilterQueryParameters
            {
                Type = FinanceRecordType.Expense
            };

            IList<int> GetExpectedIds(IList<int> ids)
            {
                return [ids[0], ids[2]];
            }

            await AssertExpectedFinanceRecords(GetFinanceRecords, queryParams, GetExpectedIds);
        }

        [Fact]
        public async Task FiltersByMultipleFields()
        {
            FinanceRecord CreateWithAmountAndType(decimal amount, FinanceRecordType type, string userId)
            {
                var record = FinanceRecordStubFactory.Create(userId);
                record.Amount = amount;
                record.Type = type;
                return record;
            }

            IList<FinanceRecord> GetFinanceRecords(string userId)
            {
                return
                [
                    CreateWithAmountAndType(1m, FinanceRecordType.Expense, userId),
                    CreateWithAmountAndType(2m, FinanceRecordType.Revenue, userId),
                    CreateWithAmountAndType(3m, FinanceRecordType.Expense, userId),
                    CreateWithAmountAndType(4m, FinanceRecordType.Revenue, userId)
                ];
            }

            var queryParams = new FinanceRecordFilterQueryParameters
            {
                MinAmount = 2.5m,
                Type = FinanceRecordType.Expense
            };

            IList<int> GetExpectedIds(IList<int> ids)
            {
                return [ids[2]];
            }

            await AssertExpectedFinanceRecords(GetFinanceRecords, queryParams, GetExpectedIds);
        }
    }
}
