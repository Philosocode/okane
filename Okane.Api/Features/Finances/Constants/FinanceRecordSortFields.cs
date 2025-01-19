namespace Okane.Api.Features.Finances.Constants;

public static class FinanceRecordSortFields
{
    public const string Amount = "Amount";
    public const string HappenedAt = "HappenedAt";

    public static readonly IEnumerable<string> AllFields = [Amount, HappenedAt];
}
