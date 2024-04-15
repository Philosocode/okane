using System.Net.Http.Json;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;

namespace Okane.Api.Tests.Testing.Utils;

public static class UserUtils
{
    public static async Task<UserResponse> RegisterUserAsync(HttpClient client, Register.Request request)
    {
        HttpResponseMessage response = await client.PostAsJsonAsync("/auth/register", request);
        var userResponse = await response.Content.ReadFromJsonAsync<ApiResponse<UserResponse>>();
        return userResponse!.Items[0];
    }

    public static async Task<UserResponse> RegisterUserAsync(HttpClient client)
    {
        var user = ApiUserStubFactory.Create();
        return await RegisterUserAsync(
            client,
            new Register.Request(user.Name, user.Email!, TestUser.Password)
        );
    }
}
