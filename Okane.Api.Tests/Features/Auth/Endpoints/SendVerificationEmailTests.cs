using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Infrastructure.Emails.Services;
using Okane.Api.Infrastructure.Emails.Utils;
using Okane.Api.Tests.Testing.Integration;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class SendVerificationEmailTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly PostgresApiFactory _apiFactory = apiFactory;

    [Fact]
    public async Task ReturnsNoContent_WhenUserDoesNotExist()
    {
        var request = new SendVerificationEmail.Request(TestUser.Email);
        var client = _apiFactory.CreateClient();
        var response = await client.PostAsJsonAsync("/auth/send-verification-email", request);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    private class TestingEmailService : IEmailService
    {
        public record Call(string To, string Subject, string Html);

        public static readonly List<Call> Calls = [];

        public static void ClearCalls()
        {
            Calls.Clear();
        }

        public Task SendAsync(string to, string subject, string html, CancellationToken cancellationToken)
        {
            Calls.Add(new Call(to, subject, html));
            return Task.CompletedTask;
        }
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

        // Registering generates an extra verification email.
        TestingEmailService.ClearCalls();

        var request = new SendVerificationEmail.Request(TestUser.Email);
        var response = await client.PostAsJsonAsync("/auth/send-verification-email", request);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        TestingEmailService.Calls.Should().HaveCount(1);
        TestingEmailService.Calls[0].Subject.Should().Be(EmailGenerator.VerifyYourEmailSubject);
        TestingEmailService.Calls[0].To.Should().Be(loginResponse.User.Email);
    }
}
