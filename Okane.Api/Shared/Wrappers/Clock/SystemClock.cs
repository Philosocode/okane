namespace Okane.Api.Shared.Wrappers.Clock;

public class SystemClock : IClock
{
    public DateTime UtcNow => DateTime.UtcNow;
}
