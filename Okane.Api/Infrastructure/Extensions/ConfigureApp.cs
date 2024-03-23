using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Infrastructure.Exceptions;
using Okane.Api.Infrastructure.HealthCheck;
using Okane.Api.Shared.Exceptions;
using Serilog;

namespace Okane.Api.Infrastructure.Extensions;

public static class ConfigureApp {
    public static async Task Configure(this WebApplication app)
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

        app.UseHealthChecks("/health", new HealthCheckOptions()
        {
            ResponseWriter = HealthCheckResponseWriter.WriteResponse
        });

        app.UseMiddleware<ProblemDetailsContentTypeMiddleware>();
        
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
