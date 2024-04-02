using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Features.Auth.Extensions;

namespace Okane.Api.Tests.Testing.Integration;

public static class TestUser
{
    public const string Email = "test@okane.com";
    public const string Name = "Test User";
    public const string Password = "SuperCoolTestingPassword1234!!!!";

    public static readonly ApiUser User = new()
    {
        Email = Email,
        Name = Name
    };

    public static async Task RegisterTestUserAsync(this HttpClient client)
    {
        var request = new Register.Request(User.Name, User.Email!, Password);
        await client.PostAsJsonAsync("/auth/register", request);
    }

    public static async Task<HttpResponseMessage> LogInTestUserAsync(this HttpClient client)
    {
        var request = new Login.Request(User.Email!, Password);
        return await client.PostAsJsonAsync("/auth/login", request);
    }

    public static async Task<AuthenticateResponse> RegisterAndLogInTestUserAsync(this HttpClient client)
    {
        await client.RegisterTestUserAsync();
        HttpResponseMessage loginResponse = await client.LogInTestUserAsync();

        var body = await loginResponse.Content.ReadFromJsonAsync<ApiResponse<AuthenticateResponse>>();
        AuthenticateResponse authResponse = body?.Items[0]!;
        client.SetBearerToken(authResponse.JwtToken);

        return authResponse;
    }

    public static async Task<ApiUser> FindTestUserAsync(this ApiDbContext db)
    {
        return await db.Users.SingleAsync(u => u.Email == User.Email);
    }
}
