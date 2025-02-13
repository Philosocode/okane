using System.Threading.RateLimiting;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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
using Okane.Api.Infrastructure.RateLimit;
using Okane.Api.Shared.Exceptions;
using Okane.Api.Shared.Extensions;
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
            builder.Services.AddHttpLogging(options =>
            {
                options.CombineLogs = true;
                options.LoggingFields = HttpLoggingFields.RequestQuery
                                        | HttpLoggingFields.RequestMethod
                                        | HttpLoggingFields.RequestPath
                                        | HttpLoggingFields.RequestHeaders
                                        | HttpLoggingFields.RequestBody
                                        | HttpLoggingFields.ResponseStatusCode
                                        | HttpLoggingFields.ResponseBody
                                        | HttpLoggingFields.Duration;
            });
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

        builder.AddRateLimiting();

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
        builder.Services.AddScoped<IFinanceTagService, FinanceTagService>();
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

    private static void AddRateLimiting(this WebApplicationBuilder builder)
    {
        builder.Services.AddRateLimiter(options =>
        {
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            {
                var windowOptions = new SlidingWindowRateLimiterOptions
                {
                    AutoReplenishment = true,
                    PermitLimit = RateLimitAmounts.AnonymousUserLimit,
                    SegmentsPerWindow = 6,
                    Window = TimeSpan.FromMinutes(1)
                };

                var key = httpContext.GetRemoteIpAddress();
                var userName = httpContext.User.Identity?.Name ?? "";
                var xUserEmail = httpContext.GetXUserEmail();

                if (userName.Length > 0)
                {
                    key = userName;

                    windowOptions.PermitLimit = RateLimitAmounts.AuthenticatedUserLimit;
                }
                else if (xUserEmail.Length > 0)
                {
                    // Unauthenticated email requests have a lower limit & longer delay. I wanted to
                    // create a chained limiter for the EmailEndpoint policy to rate limit on both the
                    // IP and email address. However, as of Feb 2025, it's currently not possible to
                    // use a chained limiter on an individual policy basis.
                    // See: https://github.com/dotnet/aspnetcore/discussions/54051

                    windowOptions.PermitLimit = RateLimitAmounts.GlobalEmailLimit;
                    windowOptions.Window = TimeSpan.FromHours(1);
                }

                return RateLimitPartition.GetSlidingWindowLimiter(key, _ => windowOptions);
            });

            options.AddPolicy(RateLimitPolicyNames.EmailEndpoint, httpContext =>
            {
                var email = httpContext.GetXUserEmail();
                var permittedPerEmail = RateLimitAmounts.PerEndpointEmailLimit;

                return RateLimitPartition.GetFixedWindowLimiter(
                    email,
                    _ => new FixedWindowRateLimiterOptions
                    {
                        AutoReplenishment = true,
                        PermitLimit = permittedPerEmail,
                        Window = TimeSpan.FromHours(1)
                    }
                );
            });


            options.OnRejected = async (context, cancellationToken) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;

                var problemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status429TooManyRequests,
                    Title = "Too Many Requests"
                };

                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                {
                    problemDetails.Detail = $"Too many requests. Please try again after {retryAfter.TotalMinutes} minute(s)";
                }
                else
                {
                    problemDetails.Detail = "Too many requests. Please try again later.";
                }

                await context.HttpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
            };
        });
    }
}
