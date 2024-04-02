using System.Net.Mime;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Okane.Api.Infrastructure.HealthCheck;

// Referenced: https://digitaldrummerj.me/aspnet-core-health-checks-json/
public static class HealthCheckResponseWriter
{
    public static Task WriteResponse(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = MediaTypeNames.Application.Json;

        JsonSerializerOptions options = new()
        {
            WriteIndented = false,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var json = JsonSerializer.Serialize(report.ToHealthCheckResponse(), options);

        return context.Response.WriteAsync(json);
    }
}
