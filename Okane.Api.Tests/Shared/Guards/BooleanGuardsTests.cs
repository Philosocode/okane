using Ardalis.GuardClauses;
using FluentAssertions;
using Okane.Api.Shared.Guards;

namespace Okane.Api.Tests.Shared.Guards;

public class BooleanGuardsTests
{
    [Fact]
    public void False_Throws_WhenFalseIsPassed()
    {
        Action result = () => Guard.Against.False(false);
        result.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void False_DoesNotThrow_WhenTrueIsPassed()
    {
        Action result = () => Guard.Against.False(true);
        result.Should().NotThrow();
    }

    [Fact]
    public void True_Throws_WhenTrueIsPassed()
    {
        Action result = () => Guard.Against.True(true);
        result.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void True_DoesNotThrow_WhenFalseIsPassed()
    {
        Action result = () => Guard.Against.True(false);
        result.Should().NotThrow();
    }
}
