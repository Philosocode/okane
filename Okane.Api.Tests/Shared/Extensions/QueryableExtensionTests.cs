using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Shared.Extensions;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;

namespace Okane.Api.Tests.Shared.Extensions;

public class QueryableExtensionTests
{
    public class OrderBySortDirection : QueryableExtensionTests, IDisposable
    {
        private readonly InMemoryContextFactory _contextFactory = new();
        private readonly ApiDbContext _db;

        public OrderBySortDirection()
        {
            _db = _contextFactory.CreateContext();
        }

        public void Dispose()
        {
            _db.Dispose();
            _contextFactory.Dispose();
        }

        private async Task SetUp(string[] names)
        {
            foreach (var name in names)
            {
                var user = ApiUserStubFactory.Create();
                user.Name = name;
                _db.Add(user);
            }

            await _db.SaveChangesAsync();
        }

        [Fact]
        public async Task ReturnsItemsInAscendingOrder_WhenIsAscendingIsTrue()
        {
            string[] names = ["Alice", "Carol", "Brock", "Andy"];
            await SetUp(names);

            var query = _db.Users.AsNoTracking();
            query = query.OrderBySortDirection(u => u.Name, true);

            var foundNames = query.Select(u => u.Name);
            foundNames.Should().Equal(["Alice", "Andy", "Brock", "Carol"]);
        }

        [Fact]
        public async Task ReturnsItemsInDescendingOrder_WhenIsAscendingIsFalse()
        {
            string[] names = ["Alice", "Carol", "Brock", "Andy"];
            await SetUp(names);

            var query = _db.Users.AsNoTracking();
            query = query.OrderBySortDirection(u => u.Name, false);

            var foundNames = query.Select(u => u.Name);
            foundNames.Should().Equal(["Carol", "Brock", "Andy", "Alice"]);
        }
    }
}
