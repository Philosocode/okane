using System.Net;
using Microsoft.EntityFrameworkCore;

namespace Okane.Api.Shared.Dtos.ApiResponses;

public record ApiPaginatedResponse<TItem> : ApiResponse<TItem>
{
    public required int CurrentPage { get; init; }
    public required int PageSize { get; init; }

    public required int TotalItems { get; init; }
    public bool HasNextPage => TotalItems > CurrentPage * PageSize;
    public bool HasPreviousPage => CurrentPage > FilterSortPageOptions.InitialPage;

    public static async Task<ApiPaginatedResponse<TItem>> CreateAsync(
        IQueryable<TItem> query,
        FilterSortPageOptions queryOptions)
    {
        return await CreateAsync(query, queryOptions.Page, queryOptions.PageSize);
    }

    public static async Task<ApiPaginatedResponse<TItem>> CreateAsync(
        IQueryable<TItem> query,
        int page,
        int pageSize)
    {
        var totalItems = await query.CountAsync();
        var pageIndex = page - 1;
        var items = await query.Skip(pageIndex * pageSize).Take(pageSize).ToListAsync();

        return new ApiPaginatedResponse<TItem>
        {
            CurrentPage = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            Items = items,
            Status = HttpStatusCode.OK
        };
    }
}
