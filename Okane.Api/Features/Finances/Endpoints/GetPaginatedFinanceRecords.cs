using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Mappers;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Shared.Dtos.QueryParameters;

namespace Okane.Api.Features.Finances.Endpoints;

public class GetPaginatedFinanceRecords : IEndpoint
{
    // TODO: Filter by description
    // TODO: Filter by date range
    // TODO: Filter by type
    // TODO: Sort by date
    // TODO: Sort by amount
    // TODO: Sort by happened at

    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapGet("", HandleAsync)
            .WithName(FinanceRecordEndpointNames.GetPaginatedFinanceRecords)
            .WithSummary("Get a paginated list of finance records.");
    }

    private static async Task<Ok<ApiPaginatedResponse<FinanceRecordResponse>>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            [AsParameters] PageQueryParameters pageQueryParameters,
            [AsParameters] SortQueryParameters sortQueryParameters,
            CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();
        var query = db.FinanceRecords
            .Where(r => r.UserId == userId)
            // TODO: Sort by query parameters.
            .OrderByDescending(r => r.HappenedAt)
            .Select(r => r.ToFinanceRecordResponse());

        var response = await ApiPaginatedResponse<FinanceRecordResponse>.CreateAsync(
            query,
            pageQueryParameters
        );

        return TypedResults.Ok(response);
    }
}
