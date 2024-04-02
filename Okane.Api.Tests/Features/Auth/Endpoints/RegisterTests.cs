using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Integration;

namespace Okane.Api.Tests.Features.Auth.Endpoints;

public class RegisterTests(PostgresApiFactory apiFactory) : DatabaseTest(apiFactory), IAsyncLifetime
{
    private readonly HttpClient _client = apiFactory.CreateClient();

    private readonly Register.Request _validRequest = new(
        TestUser.Name,
        TestUser.Email,
        TestUser.Password
    );

    [Fact]
    public async Task RegistersANewUser()
    {
        HttpResponseMessage response = await _client.PostAsJsonAsync("/auth/register", _validRequest);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().Be("/auth/self");

        var responseBody = await response.Content.ReadFromJsonAsync<ApiResponse<UserResponse>>();
        responseBody?.Items.Should().HaveCount(1);
        responseBody?.Items[0].Should().BeEquivalentTo(new UserResponse
        {
            Id = "",
            Email = _validRequest.Email,
            Name = _validRequest.Name
        }, options => options.Excluding(u => u.Id));
    }

    private async Task AssertInvalidInput(Register.Request request)
    {
        HttpResponseMessage response = await _client.PostAsJsonAsync("/auth/register", request);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var problemDetails = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problemDetails.Should().NotBeNull();
        problemDetails?.Title.Should().Be("One or more validation errors occurred.");
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

    [Fact]
    public async Task ReturnsAnError_WhenRegisteringADuplicateEmail()
    {
        await _client.RegisterTestUserAsync();

        Register.Request duplicateRequest = _validRequest with { Email = TestUser.Email! };
        HttpResponseMessage response = await _client.PostAsJsonAsync("/auth/register", duplicateRequest);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
