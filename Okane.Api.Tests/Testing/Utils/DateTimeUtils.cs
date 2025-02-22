namespace Okane.Api.Tests.Testing.Utils;

public static class DateTimeUtils
{
    public static DateTime GetUtcDate(int year, int month, int day)
    {
        return new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc);
    }
}
