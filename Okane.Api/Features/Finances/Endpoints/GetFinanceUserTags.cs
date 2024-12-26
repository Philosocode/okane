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

public class GetFinanceUserTags : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapGet("/tags", HandleAsync)
            .WithName(FinanceRecordEndpointNames.GetFinanceUserTags)
            .WithSummary("Get finance user tags created by the request user.");
    }

    private static async Task<Ok<ApiResponse<FinanceUserTagResponse>>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();
        var tags = await db.FinanceUserTags
            .AsNoTracking()
            .Include(fut => fut.Tag)
            .Where(fut => fut.UserId == userId)
            .OrderBy(fut => fut.Tag.Name)
            .Select(fut => fut.ToFinanceUserTagResponse())
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(new ApiResponse<FinanceUserTagResponse>(tags));
    }
}
