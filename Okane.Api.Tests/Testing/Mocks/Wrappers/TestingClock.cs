using Okane.Api.Shared.Wrappers;

namespace Okane.Api.Tests.Testing.Mocks.Wrappers;

public class TestingDateTimeWrapper : IDateTimeWrapper
{
    public DateTime UtcNow { get; set; } = new(2020, 12, 25);
}
