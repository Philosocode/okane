namespace Okane.Api.Shared.Constants;

public static class SortDirections
{
    public const string Asc = "asc";
    public const string Desc = "desc";

    public static readonly IList<string> AllOptions = [Asc, Desc];

    public static readonly string AllowedOptionsValidationMessage = $"Allowed sort options include: {
        string.Join(", ", AllOptions)
    }.";
}
