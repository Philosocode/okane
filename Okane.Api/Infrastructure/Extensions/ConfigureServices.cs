using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Features.Auth.Utils;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Database.HostedServices;
using Okane.Api.Infrastructure.Swagger;
using Serilog;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Okane.Api.Infrastructure.Extensions;

public static class ConfigureServices
{
    public static void AddServices(this WebApplicationBuilder builder)
    {
        builder.AddUserSecrets();
        builder.AddLogging();
        builder.AddDatabase();
        builder.Services.AddValidatorsFromAssembly(typeof(ConfigureServices).Assembly);
        builder.AddApiAuthentication();
        builder.AddServiceLayer();
        builder.AddHealthChecks();
        builder.AddSwagger();
        builder.AddHostedServices();
    }

    private static void AddUserSecrets(this WebApplicationBuilder builder)
    {
        if (builder.Environment.IsDevelopment())
        {
            builder.Configuration.AddUserSecrets<Program>();
        }
    }
    
    private static void AddLogging(this WebApplicationBuilder builder)
    {
        builder.Host.UseSerilog((context, config) =>
        {
            config.ReadFrom.Configuration(context.Configuration);
        });
    }

    private static void AddDatabase(this WebApplicationBuilder builder)
    {
        builder.Services.Configure<DbSettings>(builder.Configuration.GetSection(nameof(DbSettings)));
        builder.Services.AddDbContext<ApiDbContext>();
    }
    
    private static void AddApiAuthentication(this WebApplicationBuilder builder)
    {
        builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(nameof(JwtSettings)));
        
        builder.Services.AddIdentity<ApiUser, IdentityRole>()
            .AddEntityFrameworkStores<ApiDbContext>()
            .AddDefaultTokenProviders();

        builder.Services.AddAuthentication()
            .AddJwtBearer(options =>
            {
                string? jwtSigningKey = builder.Configuration["JwtSettings:IssuerSigningKey"];
                if (jwtSigningKey is null)
                {
                    throw new InvalidOperationException(
                        "JwtSettings:IssuerSigningKey missing from configuration file."
                    );
                }
                
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = builder.Configuration["JwtSettings.Issuer"],
                    
                    ValidateAudience = true,
                    ValidAudience = builder.Configuration["JwtSettings.Audience"],
                    
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = TokenUtils.GetIssuerSigningKey(jwtSigningKey),

                    // Set ClockSkew to zero so tokens expire exactly at token expiration time
                    // (instead of 5 minutes later).
                    ClockSkew = TimeSpan.Zero,
                };
            });
        
        builder.Services.Configure<IdentityOptions>(options =>
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
        
        builder.Services.AddAuthorization();
    }

    private static void AddServiceLayer(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<ITokenService, TokenService>();
    }
    
    private static void AddHealthChecks(this WebApplicationBuilder builder)
    {
        builder.Services
            .AddHealthChecks()
            .AddDbContextCheck<ApiDbContext>();
    }
    
    private static void AddSwagger(this WebApplicationBuilder builder)
    {
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();
        builder.Services.AddSwaggerGen(options =>
        {
            options.InferSecuritySchemes();
        });
    }
    
    private static void AddHostedServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddHostedService<RefreshTokenCleanupService>();
    }
}
