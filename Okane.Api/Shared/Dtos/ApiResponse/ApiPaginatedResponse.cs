namespace Okane.Api.Shared.Dtos.ApiResponse;

public record ApiPaginatedResponse<TItem> : ApiResponse<TItem>
{
    public required int PageSize { get; init; }
    
    public required int CurrentPage { get; init; }
    
    public required int TotalItems { get; init; }

    public bool HasNextPage => TotalItems > (CurrentPage * PageSize);
}
