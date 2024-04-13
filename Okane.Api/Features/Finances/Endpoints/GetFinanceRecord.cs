using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Mappers;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;

namespace Okane.Api.Features.Finances.Endpoints;

public class GetFinanceRecord : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapGet("/{financeRecordId:int}", HandleAsync)
            .WithName(FinanceRecordEndpointNames.GetFinanceRecord)
            .WithSummary("Get a single finance record.");
    }

    private static async Task<Results<Ok<ApiResponse<FinanceRecordResponse>>, NotFound>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            int financeRecordId,
            CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();
        FinanceRecord? financeRecord = await db.FinanceRecords
            .SingleOrDefaultAsync(
                r => r.UserId == userId && r.Id == financeRecordId,
                cancellationToken
            );

        if (financeRecord is null)
        {
            return TypedResults.NotFound();
        }

        var response = financeRecord.ToFinanceRecordResponse();
        return TypedResults.Ok(new ApiResponse<FinanceRecordResponse>(response));
    }
}
