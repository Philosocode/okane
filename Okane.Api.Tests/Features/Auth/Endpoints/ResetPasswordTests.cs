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

public class ResetPasswordTests : DatabaseTest
{
    private readonly PostgresApiFactory _apiFactory;
    private readonly HttpClient _client;

    private const string ValidPassword = "abcABC123abcABC123!!!";

    public ResetPasswordTests(PostgresApiFactory apiFactory) : base(apiFactory)
    {
        _apiFactory = apiFactory;
        _client = _apiFactory.CreateClient();
    }

    private async Task AssertResetError(HttpResponseMessage response)
    {
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var body = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        body?.Detail.Should().Be("Error resetting password");
    }

    [Fact]
    public async Task ReturnsAnError_WhenUserDoesNotExist()
    {
        var request = new ResetPassword.Request(TestUser.Email, ValidPassword, "coolToken");
        var response = await _client.PostAsJsonAsync("/auth/reset-password", request);
        await AssertResetError(response);
    }

    [Fact]
    public async Task ReturnsAnError_WhenTokenIsInvalid()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();

        var user = await Db.Users.Where(u => u.Email == loginResponse.User.Email).SingleAsync();
        user.EmailConfirmed = false;
        await Db.SaveChangesAsync();

        var request = new ResetPassword.Request(
            loginResponse.User.Email!,
            ValidPassword,
            "fake token"
        );
        var response = await _client.PostAsJsonAsync("/auth/reset-password", request);
        await AssertResetError(response);
    }

    [Fact]
    public async Task ReturnsAnError_WhenPasswordIsInvalid()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var userFromDb = await Db.Users.SingleAsync(u => u.Email == loginResponse.User.Email);

        await using var scope = _apiFactory.Services.CreateAsyncScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApiUser>>();
        var token = await userManager.GeneratePasswordResetTokenAsync(userFromDb);

        var request = new ResetPassword.Request(
            loginResponse.User.Email!,
            "invalidPassword",
            token
        );
        var response = await _client.PostAsJsonAsync("/auth/reset-password", request);
        await AssertResetError(response);
    }


    [Fact]
    public async Task ReturnsNoContent_WithValidRequest()
    {
        var loginResponse = await _client.RegisterAndLogInTestUserAsync();
        var userFromDb = await Db.Users.SingleAsync(u => u.Email == loginResponse.User.Email);

        await using var scope = _apiFactory.Services.CreateAsyncScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApiUser>>();
        var token = await userManager.GeneratePasswordResetTokenAsync(userFromDb);

        var request = new ResetPassword.Request(
            loginResponse.User.Email!,
            ValidPassword,
            token
        );
        var response = await _client.PostAsJsonAsync("/auth/reset-password", request);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }
}
