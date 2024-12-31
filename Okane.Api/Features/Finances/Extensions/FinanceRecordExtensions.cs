using Okane.Api.Features.Finances.Entities;

namespace Okane.Api.Features.Finances.Extensions;

public static class FinanceRecordExtensions
{
    public static void SortTags(this FinanceRecord financeRecord)
    {
        financeRecord.Tags = financeRecord.Tags.OrderBy(t => t.Name).ToList();
    }
}
