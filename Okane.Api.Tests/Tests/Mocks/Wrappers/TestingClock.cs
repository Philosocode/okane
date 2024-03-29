using Okane.Api.Shared.Wrappers.Clock;

namespace Okane.Api.Tests.Tests.Mocks.Wrappers;

public class TestingClock : IClock
{
    public DateTime UtcNow { get; set; } = new DateTime(2020, 12, 25);
}
