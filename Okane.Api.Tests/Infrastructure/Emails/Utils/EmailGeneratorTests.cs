using System.Net;
using FluentAssertions;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Infrastructure.Emails.Utils;

namespace Okane.Api.Tests.Infrastructure.Emails.Utils;

public class EmailGeneratorTests
{
    private const string Origin = "https://okane.com";

    public class AccountAlreadyRegistered : EmailGeneratorTests
    {
        [Fact]
        public void SendsAnEmail_WithAResetPasswordLink()
        {
            var expectedUrl = Origin + AuthClientUrls.ResetPassword;
            var content = EmailGenerator.AccountAlreadyRegistered(Origin);
            content.Subject.Should().Be(EmailGenerator.AccountAlreadyRegisteredSubject);
            content.Body.Should().Contain(
                $"<a href=\"{expectedUrl}\">{expectedUrl}</a>"
            );
        }
    }

    public class VerifyYourEmail : EmailGeneratorTests
    {
        [Fact]
        public void SendsAnEmail_WithAnEmailVerificationLink()
        {
            var email = "sirdoggo@okane.com";
            var token = "cool-token-123";
            var expectedQueryString = $"?email={WebUtility.UrlEncode(email)}&token={WebUtility.UrlEncode(token)}";
            var expectedUrl = $"{Origin}{AuthClientUrls.VerifyEmail}{expectedQueryString}";
            var content = EmailGenerator.VerifyYourEmail(email, token, Origin);
            content.Subject.Should().Be(EmailGenerator.VerifyYourEmailSubject);
            content.Body.Should().Contain(
                $"<a href=\"{expectedUrl}\">{expectedUrl}</a>"
            );
        }
    }
}
