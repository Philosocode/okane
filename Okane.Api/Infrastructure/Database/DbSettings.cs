namespace Okane.Api.Infrastructure.Database;

public record DbSettings
{
    public required string ConnectionString { get; init; }
}
