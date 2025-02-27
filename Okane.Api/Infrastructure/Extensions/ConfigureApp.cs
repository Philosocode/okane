using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Infrastructure.HealthCheck;
using Serilog;

namespace Okane.Api.Infrastructure.Extensions;

public static class ConfigureApp
{
    public static async Task ConfigureAsync(this WebApplication app)
    {
        app.UseForwardedHeaders(new ForwardedHeadersOptions
        {
            ForwardedHeaders = ForwardedHeaders.XForwardedFor |
                               ForwardedHeaders.XForwardedProto
        });

        if (app.Environment.IsDevelopment())
        {
            app.UseHttpLogging();
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        if (app.Environment.IsProduction())
        {
            app.UseSerilogRequestLogging();
        }

        app.UseStatusCodePages();
        app.UseExceptionHandler();

        var rateLimitingEnabled = app.Configuration.GetValue<bool>("RateLimitSettings:Enabled");
        if (rateLimitingEnabled)
        {
            app.UseRateLimiter();
        }

        app.UsePathBase("/api");

        app.UseHealthChecks("/health", new HealthCheckOptions
        {
            ResponseWriter = HealthCheckResponseWriter.WriteResponse
        });

        app.MapApiEndpoints();

        app.UseAuthentication();
        app.UseAuthorization();

        if (app.Environment.IsProduction())
        {
            await app.EnsureDatabaseCreatedAsync();
        }
    }

    private static async Task EnsureDatabaseCreatedAsync(this WebApplication app)
    {
        using IServiceScope scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
        await db.Database.MigrateAsync();
    }
}
