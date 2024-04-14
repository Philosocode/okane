namespace Okane.Api.Shared.Dtos;

public record FilterSortPageOptions
{
    // Filter.
    public string FilterText { get; init; } = string.Empty;

    // Sort.
    public string SortField { get; init; } = string.Empty;

    public string SortDirection { get; init; } = string.Empty;

    // Paginate.
    public const int InitialPage = 1;
    public const int DefaultPageSize = 10;

    public int Page { get; init; } = InitialPage;

    public int PageSize { get; init; } = DefaultPageSize;
}
