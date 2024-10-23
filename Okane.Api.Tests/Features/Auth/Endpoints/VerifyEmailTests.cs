using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Tests.Testing.Integration;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class VerifyEmailTests : DatabaseTest
{
    private readonly PostgresApiFactory _apiFactory;
    private readonly HttpClient _client;

    public VerifyEmailTests(PostgresApiFactory apiFactory) : base(apiFactory)
    {
        _apiFactory = apiFactory;
        _client = _apiFactory.CreateClient();
    }

    private async Task AssertValidationError(HttpResponseMessage response)
    {
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var body = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        body?.Detail.Should().Be("Error validating email");
    }

    [Fact]
    public async Task ReturnsAnError_WhenUserDoesNotExist()
    {
        var request = new VerifyEmail.Request(TestUser.Email, "coolToken");
        var response = await _client.PostAsJsonAsync("/auth/verify-email", request);
        await AssertValidationError(response);
    }

    [Fact]
    public async Task ReturnsAnError_WhenTokenIsInvalid()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();

        var user = await Db.Users.Where(u => u.Email == loginResponse.User.Email).SingleAsync();
        user.EmailConfirmed = false;
        await Db.SaveChangesAsync();

        var verifyRequest = new VerifyEmail.Request(
            loginResponse.User.Email!,
            "fake token"
        );
        var response = await _client.PostAsJsonAsync("/auth/verify-email", verifyRequest);
        await AssertValidationError(response);
    }

    [Fact]
    public async Task ReturnsNoContent_WhenTokenIsValid()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var userFromDb = await Db.Users.SingleAsync(u => u.Email == loginResponse.User.Email);

        await using var scope = _apiFactory.Services.CreateAsyncScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApiUser>>();
        var token = await userManager.GenerateEmailConfirmationTokenAsync(userFromDb);

        var verifyRequest = new VerifyEmail.Request(
            loginResponse.User.Email!,
            token
        );
        var response = await _client.PostAsJsonAsync("/auth/verify-email", verifyRequest);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }
}
