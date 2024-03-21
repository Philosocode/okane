namespace Okane.Api.Shared.Dtos.ApiResponse;

public record ApiResponse<TItem>
{
    public IEnumerable<TItem> Items { get; init; } = [];
    public IEnumerable<ApiResponseError> Errors { get; init; } = [];
    public bool HasErrors => Errors.Any();

    public ApiResponse() {}

    public ApiResponse(TItem item)
        => Items = [item];

    public ApiResponse(IEnumerable<TItem> items)
        => Items = items;
}

public record ApiResponseError
{
    public required string Message { get; init; }
    public string? Key { get; init; }
}
