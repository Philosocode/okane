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
using Okane.Api.Tests.Testing.Mocks;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class SendResetPasswordEmailTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly PostgresApiFactory _apiFactory = apiFactory;

    [Fact]
    public async Task ReturnsNoContent_WhenUserDoesNotExist()
    {
        var request = new SendResetPasswordEmail.Request(TestUser.Email);
        var client = _apiFactory.CreateClient();
        var response = await client.PostAsJsonAsync("/auth/send-reset-password-email", request);
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
        var response = await client.PostAsJsonAsync("/auth/send-reset-password-email", request);
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
        var response = await client.PostAsJsonAsync("/auth/send-reset-password-email", request);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        calls.Should().BeEmpty();
    }

}
