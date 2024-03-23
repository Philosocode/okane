using Ardalis.GuardClauses;

namespace Okane.Api.Shared.Guards;

public static class BooleanGuards
{
    public static void False(this IGuardClause guardClause, bool value)
        => AssertBoolean(value, false);

    public static void True(this IGuardClause guardClause, bool value)
        => AssertBoolean(value, true);

    private static void AssertBoolean(bool actual, bool expected)
    {
        if (actual != expected)
        {
            throw new ArgumentException($"Expected value to be {expected} but got {actual}.");
        }
    }
}
