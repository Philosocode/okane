using Okane.Api.Features.Auth.Entities;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Tests.Testing.StubFactories;

namespace Okane.Api.Tests.Testing.Utils;

public static class DbTestingUtils
{
    public static ApiUser InsertApiUser(ApiDbContext db)
    {
        var apiUser = ApiUserStubFactory.Create();
        
        db.Add(apiUser);
        
        return apiUser;
    }
}