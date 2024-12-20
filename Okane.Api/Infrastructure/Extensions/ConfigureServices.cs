using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using Okane.Api.Features.Auth.Config;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Services;
using Okane.Api.Features.Auth.Utils;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Services;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Emails.Config;
using Okane.Api.Infrastructure.Emails.Services;
using Okane.Api.Infrastructure.Emails.Utils;
using Okane.Api.Infrastructure.HealthCheck;
using Okane.Api.Infrastructure.HostedServices;
using Okane.Api.Shared.Exceptions;
using Okane.Api.Shared.Wrappers;
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
        }, true);

        builder.AddSwagger();
        builder.AddDatabase();
        builder.AddWrappers();

        builder.Services.AddValidatorsFromAssembly(typeof(ConfigureServices).Assembly);
        builder.AddApiAuthentication();

        builder.AddAppServices();

        builder.Services.AddProblemDetails();

        builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

        builder.Services.AddHealthChecks().AddDbContextCheck<ApiDbContext>();

        builder.Services.AddScoped<RefreshTokenCleaner>();
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

            options.DocumentFilter<HealthCheckDocumentFilter>();

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please provide a valid token",
                Name = JwtBearerDefaults.AuthenticationScheme,
                Type = SecuritySchemeType.Http,
                BearerFormat = "JWT",
                Scheme = JwtBearerDefaults.AuthenticationScheme
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

    private static void AddDatabase(this WebApplicationBuilder builder)
    {
        IConfigurationSection dbSettingsSection = builder.Configuration.GetSection(nameof(DbSettings));
        var dbSettings = dbSettingsSection.Get<DbSettings>();

        builder.Services.Configure<DbSettings>(dbSettingsSection);

        var dataSourceBuilder = new NpgsqlDataSourceBuilder(dbSettings?.ConnectionString);
        dataSourceBuilder.MapEnum<FinanceRecordType>();

        var dataSource = dataSourceBuilder.Build();

        builder.Services.AddDbContext<ApiDbContext>(options =>
        {
            options.UseNpgsql(dataSource);
        });
    }

    private static void AddWrappers(this WebApplicationBuilder builder)
    {
        builder.Services.AddSingleton<IDateTimeWrapper, DateTimeWrapper>();
        builder.Services.AddSingleton<IGuidWrapper, GuidWrapper>();
    }

    private static void AddAppServices(this WebApplicationBuilder builder)
    {
        builder.Services.Configure<EmailSettings>(
            builder.Configuration.GetSection(nameof(EmailSettings))
        );

        var emailSettings = new EmailSettings();
        builder.Configuration.Bind(nameof(EmailSettings), emailSettings);

        builder.Services.AddScoped<ISmtpClientGenerator, SmtpClientGenerator>();
        builder.Services.AddScoped<IEmailService, EmailService>();
        builder.Services.AddScoped<IFinanceRecordService, FinanceRecordService>();
        builder.Services.AddScoped<ITokenService, TokenService>();
    }

    private static void AddApiAuthentication(this WebApplicationBuilder builder)
    {
        builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(nameof(JwtSettings)));

        var jwtSettings = new JwtSettings();
        builder.Configuration.Bind(nameof(JwtSettings), jwtSettings);

        builder.Services
            .AddIdentity<ApiUser, IdentityRole>()
            .AddEntityFrameworkStores<ApiDbContext>()
            .AddDefaultTokenProviders();

        builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                var jwtSigningKey = jwtSettings.IssuerSigningKey;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings.Issuer,

                    ValidateAudience = true,
                    ValidAudience = jwtSettings.Audience,

                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = TokenUtils.GetIssuerSigningKey(jwtSigningKey),

                    // Set ClockSkew to zero so tokens expire exactly at token expiration time
                    // (instead of 5 minutes later).
                    ClockSkew = TimeSpan.Zero
                };
            });

        builder.Services.Configure<IdentityOptions>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequiredLength = 12; // Min length

            options.User.RequireUniqueEmail = true;
            options.Lockout.AllowedForNewUsers = true;

            options.SignIn.RequireConfirmedEmail = true;
            options.Tokens.ProviderMap.Add(
                "CustomEmailConfirmation",
                new TokenProviderDescriptor(typeof(EmailConfirmationTokenProvider<ApiUser>))
            );
            options.Tokens.EmailConfirmationTokenProvider = "CustomEmailConfirmation";
        });

        builder.Services.AddTransient<EmailConfirmationTokenProvider<ApiUser>>();

        builder.Services.AddAuthorization();
    }
}
