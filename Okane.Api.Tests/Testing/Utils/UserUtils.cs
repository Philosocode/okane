using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Endpoints;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Shared.Constants;
using Okane.Api.Tests.Testing.Extensions;
using Okane.Api.Tests.Testing.Integration;
using Okane.Api.Tests.Testing.StubFactories;

namespace Okane.Api.Tests.Testing.Utils;

public static class UserUtils
{
    public static ApiUser AddApiUser(ApiDbContext db)
    {
        ApiUser apiUser = ApiUserStubFactory.Create();

        db.Add(apiUser);

        return apiUser;
    }

    public static async Task<ApiUser> GetByEmailAsync(ApiDbContext db, string email)
    {
        return await db.Users.SingleAsync(u => u.Email == email);
    }

    public static async Task RegisterUserAsync(HttpClient client, Register.Request request)
    {
        await client.PostAsJsonAsync("/auth/register", request, new Dictionary<string, string>
        {
            [HttpHeaderNames.XUserEmail] = request.Email
        });
    }

    public static async Task<string> RegisterUserAsync(HttpClient client)
    {
        var user = ApiUserStubFactory.Create();
        await RegisterUserAsync(client, new Register.Request(user.Name, user.Email!, TestUser.Password));
        return user.Email!;
    }
}
