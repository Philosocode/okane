using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Services;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;

namespace Okane.Api.Tests.Features.Finances.Services;

public class FinanceRecordServiceTests
{
    // Tested thoroughly in GetPaginatedFinanceRecordsTests.
    public class FilterQueryableFinanceRecords : DatabaseTest
    {
        private readonly HttpClient _client;
        private readonly IFinanceRecordService _financeRecordService;

        public FilterQueryableFinanceRecords(PostgresApiFactory apiFactory) : base(apiFactory)
        {
            _client = apiFactory.CreateClient();
            _financeRecordService = new FinanceRecordService(Db);
        }

        [Fact]
        public async Task FiltersFinanceRecords()
        {
            var authResponse = await _client.RegisterAndLogInTestUserAsync();

            var financeRecords = new List<FinanceRecord>();
            financeRecords.Add(FinanceRecordStubFactory.Create(authResponse.User.Id));
            financeRecords.Add(FinanceRecordStubFactory.Create(authResponse.User.Id));

            financeRecords[0].Amount = 1;
            financeRecords[1].Amount = 3;

            Db.AddRange(financeRecords);
            await Db.SaveChangesAsync();

            var query = _financeRecordService.FilterQueryableFinanceRecords(
                Db.FinanceRecords,
                new FinanceRecordFilterQueryParameters { MinAmount = 2 },
                authResponse.User.Id
            );
            var filteredFinanceRecords = await query.ToListAsync();
            filteredFinanceRecords.Should().BeEquivalentTo([financeRecords[1]]);
        }
    }

    // Tested thoroughly in GetPaginatedFinanceRecordsTests.
    public class SortQueryableFinanceRecords : DatabaseTest
    {
        private readonly HttpClient _client;
        private readonly IFinanceRecordService _financeRecordService;

        public SortQueryableFinanceRecords(PostgresApiFactory apiFactory) : base(apiFactory)
        {
            _client = apiFactory.CreateClient();
            _financeRecordService = new FinanceRecordService(Db);
        }

        [Fact]
        public async Task SortsFinanceRecords()
        {
            var authResponse = await _client.RegisterAndLogInTestUserAsync();

            var financeRecords = new List<FinanceRecord>();
            financeRecords.Add(FinanceRecordStubFactory.Create(authResponse.User.Id));
            financeRecords.Add(FinanceRecordStubFactory.Create(authResponse.User.Id));

            financeRecords[0].Amount = 3;
            financeRecords[1].Amount = 1;

            Db.AddRange(financeRecords);
            await Db.SaveChangesAsync();

            var query = _financeRecordService.SortQueryableFinanceRecords(
                Db.FinanceRecords,
                new FinanceRecordSortQueryParameters { SortField = "amount" }
            );
            var filteredFinanceRecords = await query.ToListAsync();
            filteredFinanceRecords.Select(fr => fr.Id).Should().BeEquivalentTo([
                financeRecords[1].Id,
                financeRecords[0].Id
            ]);
        }
    }
}
