namespace Okane.Api.Shared.Dtos.QueryParameters;

public record PageQueryParameters
{
    // Paginate.
    public const int InitialPage = 1;
    public const int DefaultPageSize = 10;

    public int? Page { get; set; } = InitialPage;

    public int? PageSize { get; set; } = DefaultPageSize;
}
