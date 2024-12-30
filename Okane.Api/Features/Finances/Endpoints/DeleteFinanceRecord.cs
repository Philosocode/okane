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
            ILogger<DeleteFinanceRecord> logger,
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

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await db.FinanceRecordTags
                .Where(frt => frt.FinanceRecordId == financeRecordId)
                .ExecuteDeleteAsync(cancellationToken);

            db.Remove(financeRecord);
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);

            logger.LogWarning(
                "Transaction error: {FinanceRecordId}, {Error}",
                financeRecordId, ex.Message
            );

            throw;
        }

        return TypedResults.NoContent();
    }
}
