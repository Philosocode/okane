namespace Okane.Api.Shared.Wrappers.Clock;

public interface IClock
{
    DateTime UtcNow { get; }
}
