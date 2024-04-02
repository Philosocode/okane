using FluentAssertions;
using FluentAssertions.Execution;
using NSubstitute;

namespace Okane.Api.Tests.Testing.Assertions;

// Referenced: https://daninacan.com/how-to-easily-match-on-object-or-list-arguments-with-nsubstitute/
public static class ArgIs
{
    // This is just public in case you want to create custom ones in your tests
    // Or, you could make it private and create new extension methods utilizing it
    public static bool MatchingAssertion(Action assertion)
    {
        using var assertionScope = new AssertionScope();
        assertion();
        return !assertionScope.Discard().Any();
    }

    // This is the method we will be using
    public static T EquivalentTo<T>(T value) where T : class
    {
        return Arg.Is<T>(arg => MatchingAssertion(() => arg.Should().BeEquivalentTo(value, string.Empty)));
    }
}
