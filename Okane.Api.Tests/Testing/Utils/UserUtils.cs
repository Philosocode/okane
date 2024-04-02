using System.Net.Http.Json;
using Okane.Api.Features.Auth.Dtos.Responses;
using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;

namespace Okane.Api.Tests.Testing.Utils;

public static class UserUtils
{
    public static async Task<UserResponse> RegisterUserAsync(HttpClient client, Register.Request request)
    {
        var response = await client.PostAsJsonAsync("/auth/register", request);
        var userResponse = await response.Content.ReadFromJsonAsync<ApiResponse<UserResponse>>();
        return userResponse!.Items[0];
    }
}
