namespace Okane.Api.Features.Finances.Constants;

public static class FinanceRecordSortFields
{
    public const string Amount = "Amount";
    public const string HappenedAt = "HappenedAt";

    public static readonly IList<string> AllFields = [Amount, HappenedAt];

    public static readonly string AllowedFieldsMessage = $"Allowed sort fields include: {
        string.Join(", ", AllFields)
    }.";
}
