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
using Okane.Api.Infrastructure.RateLimit;
using Okane.Api.Shared.Constants;
using Okane.Api.Shared.Exceptions;
using Okane.Api.Tests.Testing.Assertions;
using Okane.Api.Tests.Testing.Constants;
using Okane.Api.Tests.Testing.Extensions;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.Mocks;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class RegisterTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory)
{
    private readonly PostgresApiFactory _apiFactory = apiFactory;

    private readonly Register.Request _validRequest = new(
        TestUser.Name,
        TestUser.Email,
        TestUser.Password
    );

    private readonly IDictionary<string, string> _xUserEmailHeader = new Dictionary<string, string>
    {
        [HttpHeaderNames.XUserEmail] = TestUser.Email
    };

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

    private static void AssertSendsVerificationEmail(
        string email,
        IList<TestingEmailServiceCall> calls,
        int expectedCalls = 1)
    {
        calls.Count.Should().Be(expectedCalls);
        calls.Last().Subject.Should().Be(EmailGenerator.VerifyYourEmailSubject);
        calls.Last().To.Should().Be(email);
    }

    [Fact]
    public async Task RegistersANewUserAndSendsAVerificationEmail()
    {
        var calls = TestingEmailService.CreateCalls();
        TestingEmailService.SetCalls(calls);

        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/auth/register", _validRequest, _xUserEmailHeader);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        AssertSendsVerificationEmail(_validRequest.Email, calls);
    }

    [Fact]
    public async Task ResendsVerificationEmail_WithDuplicateUnverifiedEmail()
    {
        var calls = TestingEmailService.CreateCalls();
        TestingEmailService.SetCalls(calls);

        var client = CreateClient();
        await client.RegisterTestUserAsync();

        var response = await client.PostAsJsonAsync("/auth/register", _validRequest, _xUserEmailHeader);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        AssertSendsVerificationEmail(_validRequest.Email, calls, 2);
    }

    [Fact]
    public async Task SendsAlreadyRegisteredEmail_WithDuplicateVerifiedEmail()
    {
        var calls = TestingEmailService.CreateCalls();
        TestingEmailService.SetCalls(calls);

        var client = CreateClient();
        await client.RegisterTestUserAsync();

        await Db.Users
            .Where(u => u.Email == TestUser.Email)
            .ExecuteUpdateAsync(setters => setters.SetProperty(
                u => u.EmailConfirmed,
                true
            ));

        var response = await client.PostAsJsonAsync("/auth/register", _validRequest, _xUserEmailHeader);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        calls.Count.Should().Be(2);
        calls.Last().Subject.Should().Be(EmailGenerator.AccountAlreadyRegisteredSubject);
        calls.Last().To.Should().Be(_validRequest.Email);
    }

    // Honeypot
    [Fact]
    public async Task ReturnsANoContentAndDoesNothing_ForSpamRequests()
    {
        var calls = TestingEmailService.CreateCalls();
        TestingEmailService.SetCalls(calls);

        var client = CreateClient();
        var response = await client.PostAsJsonAsync(
            "/auth/register",
            _validRequest with { City = "Legit city" },
            _xUserEmailHeader
        );

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var user = await Db.Users.Where(u => u.Email == _validRequest.Email).SingleOrDefaultAsync();
        user.Should().BeNull();
        calls.Should().BeEmpty();
    }

    // Input validation.
    [Fact]
    public async Task ReturnsA400_WhenXUserEmailIsInvalid()
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/auth/register", _validRequest, new Dictionary<string, string>
        {
            [HttpHeaderNames.XUserEmail] = "invalid@email.com"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        problemDetails.Should().NotBeNull();
        problemDetails?.Detail.Should().Be(InvalidXUserEmailResult.ErrorDetail);
    }

    private async Task AssertInvalidInput(Register.Request request)
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/auth/register", request, _xUserEmailHeader);
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
