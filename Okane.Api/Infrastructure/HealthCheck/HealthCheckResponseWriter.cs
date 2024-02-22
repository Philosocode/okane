using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Okane.Api.Infrastructure.HealthCheck;

// Referenced: https://digitaldrummerj.me/aspnet-core-health-checks-json/
public static class HealthCheckResponseWriter
{
    public static Task WriteResponse(HttpContext context, HealthReport report)
    {
        JsonSerializerOptions options = new()
        {
            WriteIndented = false,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        string json = JsonSerializer.Serialize(
            new
            {
                Status = report.Status.ToString(),
                Duration = report.TotalDuration,
                Info = report.Entries
                    .Select(e =>
                        new
                        {
                            e.Key,
                            e.Value.Description,
                            e.Value.Duration,
                            Status = Enum.GetName(typeof(HealthStatus), e.Value.Status),
                            Error = e.Value.Exception?.Message,
                            e.Value.Data
                        })
                    .ToList()
            },
            options
        );

        return context.Response.WriteAsync(json);
    }
}
