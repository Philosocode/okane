using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Constants;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Exceptions;

namespace Okane.Api.Features.Auth.Endpoints;

public class DeleteSelf : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapDelete("/self", HandleAsync)
            .WithName(AuthEndpointNames.DeleteSelf)
            .WithSummary("Delete a user's own account.");
    }

    private static async Task<Results<NoContent, BadRequest<ApiException>>> HandleAsync(
        ClaimsPrincipal claimsPrincipal,
        ApiDbContext db,
        ILogger<DeleteSelf> logger,
        UserManager<ApiUser> userManager,
        CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();
        var user = await db.Users.SingleAsync(u => u.Id == userId, cancellationToken);

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // Finances.
            await db.FinanceRecordTags
                .Include(frt => frt.FinanceRecord)
                .Where(frt => frt.FinanceRecord.UserId == userId)
                .ExecuteDeleteAsync(cancellationToken);

            await db.FinanceUserTags
                .Where(fut => fut.UserId == userId)
                .ExecuteDeleteAsync(cancellationToken);

            await db.FinanceRecords
                .Where(fr => fr.UserId == userId)
                .ExecuteDeleteAsync(cancellationToken);

            // Refresh tokens.
            await db.RefreshTokens
                .Where(t => t.UserId == userId)
                .ExecuteDeleteAsync(cancellationToken);

            var result = await userManager.DeleteAsync(user);
            if (result.Succeeded)
            {
                await transaction.CommitAsync(cancellationToken);
            }
            else
            {
                await transaction.RollbackAsync(cancellationToken);
                logger.LogWarning("userManager.DeleteAsync failed for user {UserId}", userId);

                return TypedResults.BadRequest(new ApiException("Failed to delete account"));
            }
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            logger.LogWarning("Transaction error occurred for user {UserId}: {Error}", userId, ex.Message);
        }

        return TypedResults.NoContent();
    }
}
