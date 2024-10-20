using System.Text;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Infrastructure.Emails.Constants;

namespace Okane.Api.Infrastructure.Emails.Utils;

public static class EmailGenerator
{
    public const string AccountAlreadyRegisteredSubject = "Someone tried to register with your email on Okane";
    public const string VerifyYourEmailSubject = "Verify your email on Okane";

    /// <summary>
    ///     Generate an anchor tag with href set to origin + url.
    /// </summary>
    /// <param name="url"></param>
    /// <param name="origin"></param>
    /// <returns>
    ///     <a href="origin+url">origin + url</a>
    /// </returns>
    private static string CreateEmailLink(string url, string? origin)
    {
        var fullUrl = origin ?? "";
        fullUrl += url;

        return $@"<a href=""{fullUrl}"">{fullUrl}</a>";
    }

    public static EmailTextContent AccountAlreadyRegistered(string? origin)
    {
        var builder = new StringBuilder();

        builder.Append(@"<p>Someone tried to register on Okane with your email.");
        builder.Append(@"If this wasn't you, you can safely ignore this email.");
        builder.Append(@"If you've forgotten your password, you can reset it at ");
        builder.Append(CreateEmailLink(AuthClientUrls.ResetPassword, origin));
        builder.Append(@".</p>");

        return new EmailTextContent(AccountAlreadyRegisteredSubject, builder.ToString());
    }

    public static EmailTextContent VerifyYourEmail(string email, string token, string? origin)
    {
        {
            var builder = new StringBuilder();
            var url = $"{AuthClientUrls.VerifyEmail}?email={email}&token={token}";

            builder.Append(@"<p>Thanks for registering on Okane! Click the following link to verify your email: ");
            builder.Append(CreateEmailLink(url, origin));
            builder.Append(@".</p>");

            return new EmailTextContent(VerifyYourEmailSubject, builder.ToString());
        }
    }
}
