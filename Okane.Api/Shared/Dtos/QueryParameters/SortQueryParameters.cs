namespace Okane.Api.Shared.Dtos.QueryParameters;

public record SortQueryParameters
{
    public string? SortField { get; set; }
    public string? SortDirection { get; set; }
}
