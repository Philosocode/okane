using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;
using NSubstitute;
using Okane.Api.Infrastructure.Emails.Config;
using Okane.Api.Infrastructure.Emails.Services;
using Okane.Api.Tests.Testing.Mocks.Wrappers;

namespace Okane.Api.Tests.Infrastructure.Emails.Services;

public class EmailServiceTests
{
    private readonly IOptions<EmailSettings> _options = new OptionsWrapper<EmailSettings>(
        new EmailSettings
        {
            FromEmail = "test@test.com",
            SmtpHost = "smtp.okane.com",
            SmtpPort = 1234,
            SmtpUser = "Sir Doggo",
            SmtpPassword = "cool password"
        }
    );

    public class SendAsync : EmailServiceTests
    {
        [Fact]
        public async Task SendsAnEmail()
        {
            var client = Substitute.For<ISmtpClient>();
            var service = new EmailService(_options, new TestingSmtpClientGenerator(client));

            var to = "sirDoggo@okane.com";
            var subject = "A cool subject";
            var html = "<h1>Hello world</h1>";
            var cancellationToken = new CancellationToken();

            await service.SendAsync(to, subject, html, cancellationToken);

            var expectedEmail = new MimeMessage();
            expectedEmail.From.Add(MailboxAddress.Parse(_options.Value.FromEmail));
            expectedEmail.To.Add(MailboxAddress.Parse(to));
            expectedEmail.Subject = subject;
            expectedEmail.Body = new TextPart(TextFormat.Html) { Text = html };

            await client.Received(1).SendAsync(
                Arg.Is<MimeMessage>(
                    m =>
                        m.To.Equals(expectedEmail.To) &&
                        m.From.Equals(expectedEmail.From) &&
                        m.Subject.Equals(expectedEmail.Subject)
                        && m.Body.ToString().Equals(expectedEmail.Body.ToString())
                ),
                cancellationToken);
            await client.Received(1).DisconnectAsync(true, cancellationToken);
        }
    }
}
