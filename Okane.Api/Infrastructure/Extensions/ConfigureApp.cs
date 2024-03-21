using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.HealthCheck;
using Okane.Api.Shared.Endpoints;
using Okane.Api.Shared.Middlewares;
using Serilog;

namespace Okane.Api.Infrastructure.Extensions;

public static class ConfigureApp {
    public static async Task Configure(this WebApplication app)
    {
        app.UseSerilogRequestLogging();
        
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseMiddleware<ApiExceptionMiddleware>();

        app.UseHttpsRedirection();

        app.UsePathBase("/api");

        app.UseHealthChecks("/health", new HealthCheckOptions()
        {
            ResponseWriter = HealthCheckResponseWriter.WriteResponse
        });

        app.MapApiEndpoints();
        
        app.UseAuthorization();

        if (app.Environment.IsProduction())
        {
            await app.EnsureDatabaseCreated();
        }
    }
    
    private static async Task EnsureDatabaseCreated(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
        await db.Database.MigrateAsync();
    }
}
