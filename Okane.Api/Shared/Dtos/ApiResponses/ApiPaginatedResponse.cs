using System.Net;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Shared.Dtos.QueryParameters;

namespace Okane.Api.Shared.Dtos.ApiResponses;

public record ApiPaginatedResponse<TItem> : ApiResponse<TItem>
{
    public required bool HasNextPage { get; init; }

    public static async Task<ApiPaginatedResponse<TItem>> CreateAsync(
        IQueryable<TItem> query,
        int? pageSize)
    {
        var size = pageSize ?? PageQueryParameters.DefaultPageSize;
        size = int.Max(PageQueryParameters.MinPageSize, size);

        // By fetching one extra item, we can check that there are more items available.
        var items = await query.Take(size + 1).ToListAsync();
        var hasNextPage = items.Count >= size;

        // Extra item was fetched to check if there's a next page, but we don't want to include it
        // in the response.
        if (items.Count > size)
        {
            items.RemoveAt(items.Count - 1);
        }

        return new ApiPaginatedResponse<TItem>
        {
            HasNextPage = hasNextPage,
            Items = items,
            Status = HttpStatusCode.OK
        };
    }
}
