using Microsoft.AspNetCore.Diagnostics.HealthChecks;
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
        app.UseSerilogRequestLogging();

        if (app.Environment.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseStatusCodePages();
        app.UseExceptionHandler();

        app.UseHttpsRedirection();

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
