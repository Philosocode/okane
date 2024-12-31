using FluentAssertions;
using Okane.Api.Features.Finances.Extensions;
using Okane.Api.Features.Tags.Entities;
using Okane.Api.Tests.Testing.StubFactories;

namespace Okane.Api.Tests.Features.Finances.Extensions;

public class FinanceRecordExtensionsTests
{
    public class SortTags : FinanceRecordExtensionsTests
    {
        [Fact]
        public void SortsTagsAlphabetically()
        {
            var tags = new List<Tag>
            {
                new() { Name = "aa" },
                new() { Name = "a" },
                new() { Name = "bb" },
                new() { Name = "b" }
            };

            var userId = "sir-doggo-id";
            var financeRecord = FinanceRecordStubFactory.Create(userId);
            financeRecord.Tags = tags;
            financeRecord.SortTags();

            var tagNames = financeRecord.Tags.Select(t => t.Name).ToList();
            tagNames.Should().BeEquivalentTo("a", "aa", "b", "bb");
        }
    }
}
