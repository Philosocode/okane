namespace Okane.Api.Shared.Dtos.ApiResponse;

public record ApiResponse<TItem>
{
    public IEnumerable<TItem> Items { get; init; } = Enumerable.Empty<TItem>();
}
