using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Infrastructure.Database;

namespace Okane.Api.Features.Auth.Extensions;

public static class AuthExtensions
{
    public static string? GetUserId(this ClaimsPrincipal principal)
    {
        if (principal.Identity is null || !principal.Identity.IsAuthenticated)
        {
            return "";
        }

        var idClaim = principal.Claims.SingleOrDefault(
            claim => claim.Type == ClaimTypes.NameIdentifier
        );

        return idClaim?.Value;
    }
    
    public static void AddApiAuthentication(this IServiceCollection services, ConfigurationManager configurationManager)
    {
        var jwtSettings = new JwtSettings();
        configurationManager.Bind(nameof(JwtSettings), jwtSettings);
        
        services.AddSingleton(jwtSettings);
        
        services.AddIdentity<ApiUser, IdentityRole>()
            .AddEntityFrameworkStores<ApiDbContext>()
            .AddDefaultTokenProviders();

        services.AddAuthentication(options =>
            {
                string jwtScheme = JwtBearerDefaults.AuthenticationScheme;

                options.DefaultAuthenticateScheme = jwtScheme;
                options.DefaultChallengeScheme = jwtScheme;
                options.DefaultScheme = jwtScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings.Issuer,

                    ValidateAudience = true,
                    ValidAudience = jwtSettings.Audience,

                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtSettings.IssuerSigningKey)
                    ),

                    // Set ClockSkew to zero so tokens expire exactly at token expiration time
                    // (instead of 5 minutes later).
                    ClockSkew = TimeSpan.Zero,
                };
            });
        
        services.Configure<IdentityOptions>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequiredLength = 12; // Min length

            // TODO #16: Users need to confirm their account before they can login.
            // options.SignIn.RequireConfirmedAccount = true;

            options.Lockout.AllowedForNewUsers = true;

            options.User.RequireUniqueEmail = true;
        });
    }
}
