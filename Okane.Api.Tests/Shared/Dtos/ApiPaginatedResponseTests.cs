using FluentAssertions;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Shared.Dtos.QueryParameters;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Shared.Dtos;

public class ApiPaginatedResponseTests
{
    public class CreateAsync(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
    {
        private async Task SetUp(int n)
        {
            var user = UserUtils.AddApiUser(Db);

            n = int.Max(1, n);

            for (var i = 0; i < n; i++)
            {
                Db.Add(FinanceRecordStubFactory.Create(user.Id));
            }

            await Db.SaveChangesAsync();
        }

        [Fact]
        public async Task HasNextPage_IsTrueIfThereAreMoreItems()
        {
            var pageSize = 2;
            await SetUp(pageSize + 1);

            var response = await ApiPaginatedResponse<FinanceRecord>.CreateAsync(
                Db.FinanceRecords, pageSize
            );
            response.HasNextPage.Should().BeTrue();
            response.Items.Should().HaveCount(pageSize);

            var lastId = response.Items.Last().Id;
            response = await ApiPaginatedResponse<FinanceRecord>.CreateAsync(
                Db.FinanceRecords.Where(fr => fr.Id > lastId), pageSize
            );
            response.HasNextPage.Should().BeFalse();
            response.Items.Should().HaveCount(pageSize - 1);
        }

        [Fact]
        public async Task ReplacesInvalidPagesWithADefaultValue()
        {
            await SetUp(PageQueryParameters.MinPageSize);

            var query = Db.FinanceRecords;

            int?[] invalidPageSizes = [null, 0, -1];
            foreach (var invalidPageSize in invalidPageSizes)
            {
                var response = await ApiPaginatedResponse<FinanceRecord>.CreateAsync(
                    Db.FinanceRecords, invalidPageSize
                );
                response.Items.Should().HaveCount(PageQueryParameters.MinPageSize);
            }
        }
    }
}
