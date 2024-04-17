using FluentAssertions;
using Xunit.Abstractions;
using Xunit.Sdk;

[assembly: TestFramework(
    "Okane.Api.Tests.ApiTestFramework",
    "Okane.Api.Tests")
]

namespace Okane.Api.Tests;

public class ApiTestFramework : XunitTestFramework
{
    public ApiTestFramework(IMessageSink messageSink) : base(messageSink)
    {
        AssertionOptions.AssertEquivalencyUsing(options =>
        {
            var precision = TimeSpan.FromMilliseconds(100);

            options.Using<DateTime>(
                ctx => ctx.Subject.Should().BeCloseTo(ctx.Expectation, precision)
            ).WhenTypeIs<DateTime>();

            options.Using<DateTimeOffset>(
                ctx => ctx.Subject.Should().BeCloseTo(ctx.Expectation, precision)
            ).WhenTypeIs<DateTimeOffset>();

            return options;
        });
    }
}
