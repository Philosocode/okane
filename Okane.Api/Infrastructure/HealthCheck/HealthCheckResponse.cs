using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Okane.Api.Infrastructure.HealthCheck;

public record HealthCheckReportEntry
{
    public string Key { get; init; } = string.Empty;
    public TimeSpan Duration { get; init; }
    public IReadOnlyDictionary<string, object> Data { get; init; } = default!;
    
    public string? Description { get; init; }
    public string? Status { get; init; }
    public string? Error { get; init; }
}

public record HealthCheckResponse
{
    public string Status { get; init; } = string.Empty;
    public TimeSpan TotalDuration { get; init; }
    public List<HealthCheckReportEntry> Entries { get; init; } = default!;
}

public static class HealthCheckResponseMappers
{
    public static HealthCheckResponse ToHealthCheckResponse(this HealthReport report)
        => new HealthCheckResponse
        {
            Status = report.Status.ToString(),
            TotalDuration = report.TotalDuration,
            Entries = report.Entries
                .Select(e =>
                    new HealthCheckReportEntry
                    {
                        Key = e.Key,
                        Description = e.Value.Description,
                        Duration = e.Value.Duration,
                        Status = Enum.GetName(typeof(HealthStatus), e.Value.Status),
                        Error = e.Value.Exception?.Message,
                        Data = e.Value.Data
                    })
                .ToList()
        };
}
