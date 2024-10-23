using MailKit.Net.Smtp;
using NSubstitute;
using Okane.Api.Infrastructure.Emails.Services;

namespace Okane.Api.Tests.Testing.Mocks.Wrappers;

public class TestingSmtpClientGenerator : ISmtpClientGenerator
{
    public readonly ISmtpClient SmtpClient = Substitute.For<ISmtpClient>();

    public Task<ISmtpClient> GenerateAsync()
    {
        return Task.FromResult(SmtpClient);
    }
}
