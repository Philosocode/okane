using System.Net;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Shared.Dtos.QueryParameters;

namespace Okane.Api.Shared.Dtos.ApiResponses;

public record ApiPaginatedResponse<TItem> : ApiResponse<TItem>
{
    public required int CurrentPage { get; init; }
    public required int PageSize { get; init; }

    public required int TotalItems { get; init; }
    public bool HasNextPage => TotalItems > CurrentPage * PageSize;
    public bool HasPreviousPage => CurrentPage > PageQueryParameters.InitialPage;

    public static async Task<ApiPaginatedResponse<TItem>> CreateAsync(
        IQueryable<TItem> query,
        PageQueryParameters queryParameters)
    {
        var page = queryParameters.Page ?? PageQueryParameters.InitialPage;

        // Prevent a user from passing an invalid page number.
        page = int.Max(page, PageQueryParameters.InitialPage);

        var pageSize = queryParameters.PageSize ?? PageQueryParameters.DefaultPageSize;

        // Prevent a user from passing an invalid page size.
        pageSize = int.Max(PageQueryParameters.MinPageSize, pageSize);

        return await CreateAsync(query, page, pageSize);
    }

    private static async Task<ApiPaginatedResponse<TItem>> CreateAsync(
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
