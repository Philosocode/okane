namespace Okane.Api.Shared.Dtos.ApiResponse;

public record ApiResponse<TItem>
{
    public IEnumerable<TItem> Items { get; init; } = Enumerable.Empty<TItem>();
    public IEnumerable<ApiResponseError> Errors { get; init; } = Enumerable.Empty<ApiResponseError>();
    public bool HasErrors => Errors.Any();

    public ApiResponse() {}

    public ApiResponse(TItem item)
        => Items = new[] { item };

    public ApiResponse(IEnumerable<TItem> items)
        => Items = items;
}

public record ApiResponseError
{
    public required string Message { get; init; }
    public string Key { get; init; } = string.Empty;
}
