namespace Okane.Api.Shared.Dtos.QueryParameters;

public record SortQueryParameters
{
    public string? SortDirection { get; set; }
    public string? SortField { get; set; }
}
