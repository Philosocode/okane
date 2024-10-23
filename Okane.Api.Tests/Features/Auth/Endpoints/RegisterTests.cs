using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Infrastructure.Emails.Services;
using Okane.Api.Infrastructure.Emails.Utils;
using Okane.Api.Tests.Testing.Constants;
using Okane.Api.Tests.Testing.Integration;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class RegisterTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly PostgresApiFactory _apiFactory = apiFactory;

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

    private HttpClient CreateClient()
    {
        var factory = _apiFactory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<IEmailService>();
                services.AddScoped<IEmailService, TestingEmailService>();
            });
        });

        return factory.CreateClient();
    }

    private readonly Register.Request _validRequest = new(
        TestUser.Name,
        TestUser.Email,
        TestUser.Password
    );

    private static void AssertSendsVerificationEmail(string email, int expectedCalls = 1)
    {
        TestingEmailService.Calls.Count.Should().Be(expectedCalls);
        TestingEmailService.Calls.Last().Subject.Should().Be(EmailGenerator.VerifyYourEmailSubject);
        TestingEmailService.Calls.Last().To.Should().Be(email);
    }

    [Fact]
    public async Task RegistersANewUserAndSendsAVerificationEmail()
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/auth/register", _validRequest);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        AssertSendsVerificationEmail(_validRequest.Email);
        TestingEmailService.ClearCalls();
    }

    [Fact]
    public async Task ResendsVerificationEmail_WithDuplicateUnverifiedEmail()
    {
        var client = CreateClient();
        await client.RegisterTestUserAsync();

        var response = await client.PostAsJsonAsync("/auth/register", _validRequest);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        AssertSendsVerificationEmail(_validRequest.Email, 2);
        TestingEmailService.ClearCalls();
    }

    [Fact]
    public async Task SendsAlreadyRegisteredEmail_WithDuplicateVerifiedEmail()
    {
        var client = CreateClient();
        await client.RegisterTestUserAsync();

        await Db.Users
            .Where(u => u.Email == TestUser.Email)
            .ExecuteUpdateAsync(setters => setters.SetProperty(
                u => u.EmailConfirmed,
                true
            ));

        var response = await client.PostAsJsonAsync("/auth/register", _validRequest);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        TestingEmailService.Calls.Count.Should().Be(2);
        TestingEmailService.Calls.Last().Subject.Should().Be(EmailGenerator.AccountAlreadyRegisteredSubject);
        TestingEmailService.Calls.Last().To.Should().Be(_validRequest.Email);
        TestingEmailService.ClearCalls();
    }

    // Input validation.
    private async Task AssertInvalidInput(Register.Request request)
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/auth/register", request);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problemDetails.Should().NotBeNull();
        problemDetails?.Title.Should().Be(ValidationConstants.ValidationErrorTitle);
    }

    [Fact]
    public async Task ReturnsAnError_WithEmptyName()
    {
        Register.Request request = _validRequest with { Name = "" };
        await AssertInvalidInput(request);
    }

    [Theory]
    [InlineData("")]
    [InlineData("cool")]
    [InlineData("@gmail.com")]
    public async Task ReturnsAnError_WithInvalidEmail(string email)
    {
        Register.Request request = _validRequest with { Email = email };
        await AssertInvalidInput(request);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("@")]
    [InlineData("@pass")]
    [InlineData("@pass123")]
    [InlineData("@Pass123")]
    public async Task ReturnsAnError_WithInvalidPassword(string password)
    {
        Register.Request request = _validRequest with { Password = password };
        await AssertInvalidInput(request);
    }
}
