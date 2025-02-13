using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Okane.Api.Features.Auth.Utils;
using Okane.Api.Shared.Constants;

namespace Okane.Api.Tests.Features.Auth.Utils;

public class AuthUtilsTests
{
    public class ValidateXUserEmail
    {
        [Fact]
        public void ReturnsTrue_WhenEmailsAreEqualCaseInsensitive()
        {
            var context = new DefaultHttpContext();
            context.Request.Headers.Append(HttpHeaderNames.XUserEmail, "test@okane.com");

            AuthUtils.ValidateXUserEmail(context, "test@okane.COM").Should().BeTrue();
            AuthUtils.ValidateXUserEmail(context, "TEST@OKANE.COM").Should().BeTrue();

            AuthUtils.ValidateXUserEmail(context, "other@okane.com").Should().BeFalse();
        }
    }
}
