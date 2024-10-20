using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using Okane.Api.Infrastructure.Emails.Config;

namespace Okane.Api.Infrastructure.Emails.Services;

public interface ISmtpClientGenerator
{
    Task<ISmtpClient> GenerateAsync();
}

public class SmtpClientGenerator(IOptions<EmailSettings> emailOptions) : ISmtpClientGenerator
{
    public async Task<ISmtpClient> GenerateAsync()
    {
        var emailSettings = emailOptions.Value;

        var client = new SmtpClient();
        await client.ConnectAsync(
            emailSettings.SmtpHost,
            emailSettings.SmtpPort,
            SecureSocketOptions.StartTls
        );
        await client.AuthenticateAsync(emailSettings.SmtpUser, emailSettings.SmtpPassword);

        return client;
    }
}
