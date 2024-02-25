using Okane.Api.Features.Auth.Models;
using Okane.Api.Infrastructure.Database;

namespace Okane.Api.Features.Auth.Extensions;

public static class AuthExtensions
{
    public static void AddIdentityAuth(this IServiceCollection services)
    {
        services.AddAuthorization();
        
        services.AddIdentityApiEndpoints<ApiUser>(options => 
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequiredLength = 12; // Min length
            
            // TODO #16: Users need to confirm their account before they can login.
            // options.SignIn.RequireConfirmedAccount = true;

            options.Lockout.AllowedForNewUsers = true; 
        })
        .AddEntityFrameworkStores<ApiDbContext>();
    }
}
