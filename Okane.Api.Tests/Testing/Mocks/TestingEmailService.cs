using Okane.Api.Infrastructure.Emails.Services;

namespace Okane.Api.Tests.Testing.Mocks;

public record TestingEmailServiceCall(string To, string Subject, string Html);

public class TestingEmailService : IEmailService
{
    private static IList<TestingEmailServiceCall>? Calls { get; set; }

    public static IList<TestingEmailServiceCall> CreateCalls()
    {
        return [];
    }

    public static void SetCalls(IList<TestingEmailServiceCall>? calls)
    {
        Calls = calls;
    }

    public static void ClearCalls()
    {
        Calls?.Clear();
    }

    public Task SendAsync(string to, string subject, string html, CancellationToken cancellationToken)
    {
        Calls?.Add(new TestingEmailServiceCall(to, subject, html));
        return Task.CompletedTask;
    }
}
