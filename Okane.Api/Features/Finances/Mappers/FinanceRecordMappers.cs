using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;

namespace Okane.Api.Features.Finances.Mappers;

public static class FinanceRecordMappers
{
    public static FinanceRecordResponse ToFinanceRecordResponse(this FinanceRecord financeRecord)
    {
        return new FinanceRecordResponse
        {
            Id = financeRecord.Id,
            Amount = financeRecord.Amount,
            Description = financeRecord.Description,
            HappenedAt = financeRecord.HappenedAt,
            Tags = financeRecord.Tags,
            Type = financeRecord.Type
        };
    }
}
