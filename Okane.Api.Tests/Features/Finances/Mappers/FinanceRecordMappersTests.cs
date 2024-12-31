using FluentAssertions;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Mappers;
using Okane.Api.Tests.Testing.StubFactories;

namespace Okane.Api.Tests.Features.Finances.Mappers;

public class FinanceRecordMappersTests
{
    public class ToFinanceRecordResponse : FinanceRecordMappersTests
    {
        [Fact]
        public void ReturnsTheExpectedResponse()
        {
            var userId = "cool-user-id";
            var financeRecord = FinanceRecordStubFactory.Create(userId);
            financeRecord.Tags = TagStubFactory.CreateN(3);

            var result = financeRecord.ToFinanceRecordResponse();
            result.Should().BeEquivalentTo(new FinanceRecordResponse
            {
                Amount = financeRecord.Amount,
                Description = financeRecord.Description,
                HappenedAt = financeRecord.HappenedAt,
                Id = financeRecord.Id,
                Tags = financeRecord.Tags,
                Type = financeRecord.Type
            });
        }
    }
}
