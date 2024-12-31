using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Mappers;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;

namespace Okane.Api.Features.Finances.Endpoints;

public class GetFinanceUserTag : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapGet("/{financeUserTagId:int}", HandleAsync)
            .WithName(FinanceRecordEndpointNames.GetFinanceUserTag)
            .WithSummary("Get finance user tag by ID.");
    }

    private static async Task<Results<Ok<ApiResponse<FinanceUserTagResponse>>, NotFound>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            int financeUserTagId,
            CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();
        var tag = await db.FinanceUserTags
            .AsNoTracking()
            .Where(fut => fut.UserId == userId)
            .Where(fut => fut.Id == financeUserTagId)
            .SingleOrDefaultAsync(cancellationToken);

        if (tag is null)
        {
            return TypedResults.NotFound();
        }

        var response = new ApiResponse<FinanceUserTagResponse>(tag.ToFinanceUserTagResponse());
        return TypedResults.Ok(response);
    }
}
