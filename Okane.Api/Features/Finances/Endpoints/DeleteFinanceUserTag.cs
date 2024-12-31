using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;

namespace Okane.Api.Features.Finances.Endpoints;

public class DeleteFinanceUserTag : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapDelete("/{financeUserTagId:int}", HandleAsync)
            .WithName(FinanceRecordEndpointNames.DeleteFinanceUserTag)
            .WithSummary("Delete a finance user tag created by the request user.");
    }

    private static async Task<Results<NoContent, NotFound>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            int financeUserTagId,
            ILogger<DeleteFinanceUserTag> logger,
            CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();
        var userTag = await db.FinanceUserTags
            .Where(fut => fut.Id == financeUserTagId)
            .Where(fut => fut.UserId == userId)
            .SingleOrDefaultAsync(cancellationToken);

        if (userTag is null)
        {
            return TypedResults.NotFound();
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // We need to also check the type because the same tag could be used for both expense
            // and revenue finance records. e.g. If the user is trying to delete "revenue gift",
            // "gift" should be removed from revenue finance records, but not expense finance records.
            await db.FinanceRecordTags
                .Include(frt => frt.FinanceRecord)
                .Where(frt => frt.FinanceRecord.UserId == userId)
                .Where(frt => frt.TagId == userTag.TagId)
                .Where(frt => frt.FinanceRecord.Type == userTag.Type)
                .ExecuteDeleteAsync(cancellationToken);

            db.Remove(userTag);

            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);

            logger.LogWarning(
                "Transaction error: {FinanceUserTagId}: {Error}",
                userId, ex.Message
            );

            throw;
        }

        return TypedResults.NoContent();
    }
}
