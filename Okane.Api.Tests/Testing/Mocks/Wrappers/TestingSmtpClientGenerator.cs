using MailKit.Net.Smtp;
using Okane.Api.Infrastructure.Emails.Services;

namespace Okane.Api.Tests.Testing.Mocks.Wrappers;

public class TestingSmtpClientGenerator(ISmtpClient client) : ISmtpClientGenerator
{
    public Task<ISmtpClient> GenerateAsync()
    {
        return Task.FromResult(client);
    }
}
