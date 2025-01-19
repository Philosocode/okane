namespace Okane.Api.Shared.Constants;

public static class SortDirections
{
    public const string Asc = "asc";
    public const string Desc = "desc";

    public static readonly IEnumerable<string> AllOptions = [Asc, Desc];

    public static bool IsAscending(string? value)
    {
        if (value is null)
        {
            return false;
        }

        return value.Equals(Asc, StringComparison.OrdinalIgnoreCase);
    }
}
