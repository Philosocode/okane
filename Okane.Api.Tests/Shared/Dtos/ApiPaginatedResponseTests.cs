using FluentAssertions;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Shared.Dtos.QueryParameters;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;
using Okane.Api.Tests.Testing.Utils;

namespace Okane.Api.Tests.Shared.Dtos;

public class ApiPaginatedResponseTests
{
    public class CreateAsync : ApiPaginatedResponseTests, IDisposable
    {
        private readonly InMemoryContextFactory _contextFactory = new();
        private readonly ApiDbContext _db;

        public CreateAsync()
        {
            _db = _contextFactory.CreateContext();
        }

        public void Dispose()
        {
            _db.Dispose();
            _contextFactory.Dispose();
        }

        private async Task SetUp(int n = PageQueryParameters.DefaultPageSize)
        {
            var user = DbContextUtils.AddApiUser(_db);

            n = int.Max(1, n);

            for (var i = 0; i < n; i++)
            {
                _db.Add(FinanceRecordStubFactory.Create(user.Id));
            }

            await _db.SaveChangesAsync();
        }

        [Fact]
        public async Task ReturnsTheTotalNumberOfItems()
        {
            var n = 5;
            await SetUp(n);

            var response = await ApiPaginatedResponse<FinanceRecord>.CreateAsync(
                _db.FinanceRecords,
                new PageQueryParameters()
            );

            response.TotalItems.Should().Be(n);
        }

        [Fact]
        public async Task HasNextPage_ReturnsIfThereAreMoreItems()
        {
            var n = 2;
            await SetUp(n);

            var response = await ApiPaginatedResponse<FinanceRecord>.CreateAsync(
                _db.FinanceRecords,
                new PageQueryParameters { PageSize = 1 }
            );

            response.HasNextPage.Should().BeTrue();

            response = await ApiPaginatedResponse<FinanceRecord>.CreateAsync(
                _db.FinanceRecords,
                new PageQueryParameters { Page = 2, PageSize = 1 }
            );

            response.HasNextPage.Should().BeFalse();
        }

        [Fact]
        public async Task HasPreviousPage_ReturnsIfTheresAPreviousPage()
        {
            await SetUp();

            var response = await ApiPaginatedResponse<FinanceRecord>.CreateAsync(
                _db.FinanceRecords,
                new PageQueryParameters { Page = PageQueryParameters.InitialPage }
            );

            response.HasPreviousPage.Should().BeFalse();

            response = await ApiPaginatedResponse<FinanceRecord>.CreateAsync(
                _db.FinanceRecords,
                new PageQueryParameters { Page = PageQueryParameters.InitialPage + 1 }
            );

            response.HasPreviousPage.Should().BeTrue();
        }

        [Fact]
        public async Task ReplacesNullQueryParametersWithDefaultValues()
        {
            await SetUp();

            var query = _db.FinanceRecords;
            var response = await ApiPaginatedResponse<FinanceRecord>.CreateAsync(
                query,
                new PageQueryParameters()
            );

            response.CurrentPage.Should().Be(PageQueryParameters.InitialPage);
            response.PageSize.Should().Be(PageQueryParameters.DefaultPageSize);
        }

        [Fact]
        public async Task ReplacesInvalidPagesWithADefaultValue()
        {
            await SetUp();

            var query = _db.FinanceRecords;
            var response = await ApiPaginatedResponse<FinanceRecord>.CreateAsync(
                query,
                new PageQueryParameters { Page = -1 }
            );

            response.CurrentPage.Should().Be(PageQueryParameters.InitialPage);

            response = await ApiPaginatedResponse<FinanceRecord>.CreateAsync(
                query,
                new PageQueryParameters { Page = 0 }
            );

            response.CurrentPage.Should().Be(PageQueryParameters.InitialPage);
        }

        [Fact]
        public async Task ReplacesInvalidPageSizesWithADefaultValue()
        {
            await SetUp();

            var query = _db.FinanceRecords;
            var response = await ApiPaginatedResponse<FinanceRecord>.CreateAsync(
                query,
                new PageQueryParameters { PageSize = 0 }
            );

            response.PageSize.Should().Be(PageQueryParameters.MinPageSize);
        }
    }
}