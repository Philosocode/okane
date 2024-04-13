using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;

namespace Okane.Api.Features.Finances.Endpoints;

public class DeleteFinanceRecord : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapDelete("/{financeRecordId:int}", HandleAsync)
            .WithName(FinanceRecordEndpointNames.DeleteFinanceRecord)
            .WithSummary("Delete a finance record.");
    }

    private static async Task<Results<NoContent, NotFound>>
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

        db.Remove(financeRecord);
        await db.SaveChangesAsync(cancellationToken);

        return TypedResults.NoContent();
    }
}
