namespace Okane.Api.Infrastructure.Emails.Config;

public record EmailSettings
{
    public string FromEmail { get; init; } = string.Empty;
    public string SmtpHost { get; init; } = string.Empty;
    public string SmtpUser { get; init; } = string.Empty;
    public string SmtpPassword { get; init; } = string.Empty;
    public int SmtpPort { get; init; }
}
