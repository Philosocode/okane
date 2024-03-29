using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Features.Auth.Utils;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Database.HostedServices;
using Okane.Api.Shared.Exceptions;
using Okane.Api.Shared.Wrappers.Clock;
using Okane.Api.Shared.Wrappers.GuidGenerator;
using Serilog;

namespace Okane.Api.Infrastructure.Extensions;

public static class ConfigureServices
{
    public static void AddServices(this WebApplicationBuilder builder)
    {
        if (builder.Environment.IsDevelopment())
        {
            builder.Configuration.AddUserSecrets<Program>();
        }
        
        builder.Host.UseSerilog((context, config) =>
        {
            config.ReadFrom.Configuration(context.Configuration);
        });

        builder.AddSwagger();
        
        builder.Services.Configure<DbSettings>(builder.Configuration.GetSection(nameof(DbSettings)));
        builder.Services.AddDbContext<ApiDbContext>();

        builder.AddWrappers();
        
        builder.Services.AddValidatorsFromAssembly(typeof(ConfigureServices).Assembly);
        builder.AddApiAuthentication();
        
        builder.Services.AddScoped<ITokenService, TokenService>();

        builder.Services.AddProblemDetails();
        
        builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
        
        builder.Services.AddHealthChecks().AddDbContextCheck<ApiDbContext>();
 
        builder.Services.AddHostedService<RefreshTokenCleanupService>();
    }
    
    private static void AddSwagger(this WebApplicationBuilder builder)
    {
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Version = "v1",
                Title = "Okane API",
                Description = "API for managing finance and investment records"
            });
            
            options.CustomSchemaIds(type => type.FullName?.Replace('+', '.'));
            
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please provide a valid token",
                Name = JwtBearerDefaults.AuthenticationScheme,
                Type = SecuritySchemeType.Http,
                BearerFormat = "JWT",
                Scheme = JwtBearerDefaults.AuthenticationScheme,
            });
            
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = JwtBearerDefaults.AuthenticationScheme
                        }
                    },
                    []
                }
            });
        });
    }

    private static void AddWrappers(this WebApplicationBuilder builder)
    {
        builder.Services.AddSingleton<IClock, SystemClock>();
        builder.Services.AddSingleton<IGuidGenerator, GuidGenerator>();
    }


    private static void AddApiAuthentication(this WebApplicationBuilder builder)
    {
        builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(nameof(JwtSettings)));
        
        builder.Services
            .AddIdentity<ApiUser, IdentityRole>()
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
}
