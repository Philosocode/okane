using Okane.Api.Features.Tags.Entities;

namespace Okane.Api.Features.Finances.Entities;

public class FinanceRecordTag
{
    public int FinanceRecordId { get; set; }
    public FinanceRecord FinanceRecord { get; set; } = null!;

    public int TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}
