namespace Okane.Api.Shared.Dtos.Responses;

public record ApiResponse<TResponse>
{
    public required IEnumerable<TResponse> Items { get; init; } = Enumerable.Empty<TResponse>();
}

public record PaginatedApiResponse<TResponse> : ApiResponse<TResponse>
{
    public required int PageSize { get; init; }
    
    public required int CurrentPage { get; init; }
    
    public required int TotalItems { get; init; }

    public bool HasNextPage => TotalItems > (CurrentPage * PageSize);
}

public record ValidationErrorsApiResponse<TResponse> : ApiResponse<TResponse>
{
    public required IEnumerable<ValidationError> Errors { get; init; }
}

public record ValidationError
{
    public required string PropertyName { get; init; }

    public required string Message { get; init; }
}


