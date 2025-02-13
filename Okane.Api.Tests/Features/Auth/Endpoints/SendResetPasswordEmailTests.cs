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

public class SendResetPasswordEmailTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly PostgresApiFactory _apiFactory = apiFactory;
    private readonly string _endpointUrl = "/auth/send-reset-password-email";

    private static IDictionary<string, string> GetXUserEmailHeader(string email)
    {
        return new Dictionary<string, string>
        {
            [HttpHeaderNames.XUserEmail] = email
        };
    }

    [Fact]
    public async Task ReturnsNoContent_WhenUserDoesNotExist()
    {
        var request = new SendResetPasswordEmail.Request("random-user@okane.com");
        var client = _apiFactory.CreateClient();
        var response = await client.PostAsJsonAsync(_endpointUrl, request, GetXUserEmailHeader(request.Email));
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
        await client.RegisterTestUserAsync();

        var calls = TestingEmailService.CreateCalls();
        TestingEmailService.SetCalls(calls);

        var request = new SendResetPasswordEmail.Request(TestUser.Email);
        var response = await client.PostAsJsonAsync(_endpointUrl, request, GetXUserEmailHeader(request.Email));
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        calls.Should().HaveCount(1);
        calls[0].Subject.Should().Be(EmailGenerator.ResetYourPasswordSubject);
        calls[0].To.Should().Be(TestUser.Email);
    }

    [Fact]
    public async Task ReturnsNoContentAndDoesNothing_ForSpamRequests()
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
        await client.RegisterTestUserAsync();

        var calls = TestingEmailService.CreateCalls();
        TestingEmailService.SetCalls(calls);

        var request = new SendResetPasswordEmail.Request(TestUser.Email, "Coolest City");
        var response = await client.PostAsJsonAsync(_endpointUrl, request, GetXUserEmailHeader(request.Email));
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        calls.Should().BeEmpty();
    }
}
