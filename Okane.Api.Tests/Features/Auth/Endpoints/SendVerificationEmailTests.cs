using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Infrastructure.Emails.Services;
using Okane.Api.Infrastructure.Emails.Utils;
using Okane.Api.Infrastructure.RateLimit;
using Okane.Api.Shared.Constants;
using Okane.Api.Tests.Testing.Assertions;
using Okane.Api.Tests.Testing.Extensions;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.Mocks;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class SendVerificationEmailTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly PostgresApiFactory _apiFactory = apiFactory;
    private readonly string _endpointUrl = "/auth/send-verification-email";

    private readonly IDictionary<string, string> _xUserEmailHeader = new Dictionary<string, string>
    {
        [HttpHeaderNames.XUserEmail] = TestUser.Email
    };

    [Fact]
    public async Task ReturnsNoContent_WhenUserDoesNotExist()
    {
        var request = new SendVerificationEmail.Request("random@okane.com");
        var client = _apiFactory.CreateClient();
        var response = await client.PostAsJsonAsync(_endpointUrl, request, new Dictionary<string, string>
        {
            [HttpHeaderNames.XUserEmail] = request.Email
        });
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task ReturnsNoContentAndSendsEmail_WhenUserExists()
    {
        var factory = _apiFactory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<IEmailService>();
                services.AddScoped<IEmailService, TestingEmailService>();
            });
        });

        var client = factory.CreateClient();
        var loginResponse = await client.RegisterAndLogInTestUserAsync();

        var calls = TestingEmailService.CreateCalls();
        TestingEmailService.SetCalls(calls);

        var request = new SendVerificationEmail.Request(TestUser.Email);
        var response = await client.PostAsJsonAsync(_endpointUrl, request, _xUserEmailHeader);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        calls.Should().HaveCount(1);
        calls[0].Subject.Should().Be(EmailGenerator.VerifyYourEmailSubject);
        calls[0].To.Should().Be(loginResponse.User.Email);
    }
}
