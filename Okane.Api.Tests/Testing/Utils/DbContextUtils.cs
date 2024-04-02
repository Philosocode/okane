using Okane.Api.Features.Auth.Entities;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Tests.Testing.StubFactories;

namespace Okane.Api.Tests.Testing.Utils;

/// <summary>
/// Utils for working with a standalone DbContext. These are intended for use when directly
/// injecting an ApiDbContext as opposed to using a WebApplicationFactory.
/// </summary>
public static class DbContextUtils
{
    public static ApiUser AddApiUser(ApiDbContext db)
    {
        var apiUser = ApiUserStubFactory.Create();
        
        db.Add(apiUser);
        
        return apiUser;
    }
}
