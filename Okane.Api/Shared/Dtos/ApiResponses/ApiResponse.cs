using System.Net;

namespace Okane.Api.Shared.Dtos.ApiResponses;

public record ApiResponse<TItem>
{
    public IEnumerable<TItem> Items { get; init; } = [];
    
    public HttpStatusCode Status { get; init; } = HttpStatusCode.OK;

    public ApiResponse() {}

    public ApiResponse(TItem item)
        => Items = [item];

    public ApiResponse(IEnumerable<TItem> items)
        => Items = items;
}
