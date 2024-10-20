using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;
using Okane.Api.Infrastructure.Emails.Config;

namespace Okane.Api.Infrastructure.Emails.Services;

internal interface IEmailService
{
    Task SendAsync(string to, string subject, string html, CancellationToken cancellationToken);
}

public class EmailService(
    IOptions<EmailSettings> emailOptions,
    ISmtpClientGenerator smtpClientGenerator) : IEmailService
{
    public async Task SendAsync(string to, string subject, string html, CancellationToken cancellationToken)
    {
        var emailSettings = emailOptions.Value;

        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse(emailSettings.FromEmail));
        email.To.Add(MailboxAddress.Parse(to));
        email.Subject = subject;
        email.Body = new TextPart(TextFormat.Html) { Text = html };

        using var smtpClient = await smtpClientGenerator.GenerateAsync();
        await smtpClient.SendAsync(email, cancellationToken);
        await smtpClient.DisconnectAsync(true, cancellationToken);
    }
}
