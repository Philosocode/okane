using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Constants;
using Okane.Api.Tests.Testing.Integration;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class PatchSelfTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    private readonly PatchSelf.Request _validRequest = new(
        "Updated Name",
        TestUser.Password,
        "!!!4321DCBAdcba"
    );

    public new async Task InitializeAsync()
    {
        await _client.RegisterAndLogInTestUserAsync();
    }

    [Fact]
    public async Task UpdatesOnlyTheName()
    {
        var request = _validRequest with { CurrentPassword = "", NewPassword = "" };
        var response = await _client.PatchAsJsonAsync("/auth/self", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var userFromDb = await Db.Users.SingleAsync(u => u.Email == TestUser.Email);
        userFromDb.Name.Should().Be(_validRequest.Name);
    }

    [Fact]
    public async Task UpdatesOnlyThePassword()
    {
        var updateRequest = _validRequest with { Name = "" };
        var updateResponse = await _client.PatchAsJsonAsync("/auth/self", updateRequest);
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var loginRequest = new Login.Request(TestUser.Email, updateRequest.NewPassword!);
        var loginResponse = await _client.PostAsJsonAsync("/auth/login", loginRequest);
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task UpdatesMultipleFields()
    {
        var updateResponse = await _client.PatchAsJsonAsync("/auth/self", _validRequest);
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var loginRequest = new Login.Request(TestUser.Email, _validRequest.NewPassword!);
        var loginResponse = await _client.PostAsJsonAsync("/auth/login", loginRequest);
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var authResponse = await loginResponse.Content.ReadFromJsonAsync<ApiResponse<AuthenticateResponse>>();
        authResponse.Should().NotBeNull();
        authResponse?.Items.Should().ContainSingle(
            r => r.User.Name == _validRequest.Name
        );
    }

    // Request validation.
    private async Task AssertInvalidRequest(PatchSelf.Request request)
    {
        var response = await _client.PatchAsJsonAsync("/auth/self", request);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problemDetails.Should().NotBeNull();
        problemDetails?.Title.Should().Be(ValidationConstants.ValidationErrorTitle);
    }

    [Fact]
    public async Task ReturnsAValidationError_WhenOnePasswordIsProvided()
    {
        var request = _validRequest with { CurrentPassword = "" };
        await AssertInvalidRequest(request);

        request = _validRequest with { NewPassword = "" };
        await AssertInvalidRequest(request);
    }

    [Fact]
    public async Task ReturnsAValidationError_WhenCurrentPasswordIsInvalid()
    {
        var request = _validRequest with { CurrentPassword = "WRONGpassword1234!!!" };
        await AssertInvalidRequest(request);
    }

    [Fact]
    public async Task ReturnsAValidationError_WhenNewPasswordIsInvalid()
    {
        var request = _validRequest with { NewPassword = "tooshort" };
        await AssertInvalidRequest(request);
    }
}
