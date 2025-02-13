using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Okane.Api.Shared.Constants;
using Okane.Api.Shared.Extensions;

namespace Okane.Api.Tests.Shared.Extensions;

public class HttpContextExtensionTests
{
    public class GetRemoteIpAddress
    {
        [Fact]
        public void ReturnsTheIpAddress()
        {
            var context = new DefaultHttpContext();
            context.GetRemoteIpAddress().Should().BeEmpty();

            context.Connection.RemoteIpAddress = new IPAddress([127, 0, 0, 1]);
            context.GetRemoteIpAddress().Should().Be("127.0.0.1");
        }
    }

    public class GetXUserEmail
    {
        [Fact]
        public void ReturnsTheHeaderValue_IfItExists()
        {
            var context = new DefaultHttpContext();
            context.GetXUserEmail().Should().BeEmpty();

            var email = "sir-doggo@okane.com";
            context.Request.Headers.Append(HttpHeaderNames.XUserEmail, email);
            context.GetXUserEmail().Should().Be(email);
        }
    }
}
