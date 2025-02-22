using Okane.Api.Shared.Constants;

namespace Okane.Api.Features.Finances.Constants;

public static class FinanceRecordsStatsIntervals
{
    public static readonly IEnumerable<string> AllOptions =
    [
        TimeIntervals.Day,
        TimeIntervals.Week,
        TimeIntervals.Month,
        TimeIntervals.Year
    ];
}
