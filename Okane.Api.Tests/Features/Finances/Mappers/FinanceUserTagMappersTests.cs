using FluentAssertions;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Mappers;
using Okane.Api.Features.Tags.Entities;

namespace Okane.Api.Tests.Features.Finances.Mappers;

public class FinanceUserTagMappersTests
{
    public class ToFinanceUserTagResponse : FinanceUserTagMappersTests
    {
        [Fact]
        public void ReturnsTheExpectedResponse()
        {
            var userTag = new FinanceUserTag
            {
                Id = 1,
                Tag = new Tag { Id = 1, Name = "1" },
                Type = FinanceRecordType.Expense
            };

            var result = userTag.ToFinanceUserTagResponse();
            result.Should().BeEquivalentTo(new FinanceUserTagResponse
            {
                Id = userTag.Id,
                Tag = userTag.Tag,
                Type = userTag.Type
            });
        }
    }
}
