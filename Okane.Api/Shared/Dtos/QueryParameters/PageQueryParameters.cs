namespace Okane.Api.Shared.Dtos.QueryParameters;

public record PageQueryParameters
{
    public const int InitialPage = 1;
    public const int DefaultPageSize = 10;
    public const int MinPageSize = 1;

    public int? Page { get; set; } = InitialPage;

    public int? PageSize { get; set; } = DefaultPageSize;
}
