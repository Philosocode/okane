using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Mappers;
using Okane.Api.Features.Finances.Services;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Shared.Exceptions;

namespace Okane.Api.Features.Finances.Endpoints;

public class PostRenameFinanceUserTag : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPost("/{financeUserTagId:int}/rename", HandleAsync)
            .WithName(FinanceRecordEndpointNames.PostRenameFinanceUserTag)
            .WithSummary("Rename a finance user tag.");
    }

    public record Request(string Name);

    private static async Task<Results<Ok<ApiResponse<FinanceUserTagResponse>>, BadRequest<ApiException>, NotFound>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            int financeUserTagId,
            ILogger<PostFinanceUserTag> logger,
            Request request,
            IFinanceTagService tagService,
            IValidator<FinanceRecord> validator,
            CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();

        var (currUserTag, nextUserTag) = await QueryCurrentAndNextFinanceUserTagAsync(
            db, financeUserTagId, request.Name, userId, cancellationToken
        );

        if (currUserTag is null)
        {
            return TypedResults.NotFound();
        }

        if (currUserTag.Tag.Name.Equals(request.Name, StringComparison.InvariantCultureIgnoreCase))
        {
            return TypedResults.BadRequest(
                new ApiException("Current tag name and updated tag name should be different.")
            );
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            nextUserTag ??= await tagService.CreateFinanceUserTagAsync(
                request.Name, currUserTag.Type, userId, cancellationToken
            );

            await RenameAsync(currUserTag, db, financeUserTagId, nextUserTag, cancellationToken);

            await transaction.CommitAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);

            logger.LogWarning(
                "Transaction error renaming {FinanceUserTagId} to {NextFinanceUserTagId}: {Error}",
                currUserTag.Id, nextUserTag?.Id, ex.Message
            );

            throw;
        }

        var response = new ApiResponse<FinanceUserTagResponse>(nextUserTag.ToFinanceUserTagResponse());
        return TypedResults.Ok(response);
    }

    /// <summary>
    ///     Get the current finance user tag (to be renamed) and next finance user tag
    ///     (to be renamed to).
    /// </summary>
    /// <param name="db"></param>
    /// <param name="financeUserTagId"></param>
    /// <param name="updatedTagName"></param>
    /// <param name="userId"></param>
    /// <param name="cancellationToken"></param>
    private static async Task<(FinanceUserTag? CurrUserTag, FinanceUserTag? NextUserTag)>
        QueryCurrentAndNextFinanceUserTagAsync(
            ApiDbContext db,
            int financeUserTagId,
            string updatedTagName,
            string userId,
            CancellationToken cancellationToken)
    {
        // This query may return up to three things:
        // - finance user tag to rename (should exist)
        // - finance user tag with the updated name (if it exists)
        // - finance user tag with the updated name and opposite type (if it exists)
        var relevantTags = await db.FinanceUserTags
            .Include(fut => fut.Tag)
            .Where(fut => fut.UserId == userId)
            .Where(fut => fut.Id == financeUserTagId || fut.Tag.Name.Equals(updatedTagName))
            .ToListAsync(cancellationToken);

        var currUserTag = relevantTags.FirstOrDefault(fut => fut.Id == financeUserTagId);
        var nextUserTag = relevantTags.FirstOrDefault(
            fut => fut.Tag.Name.Equals(updatedTagName, StringComparison.InvariantCultureIgnoreCase)
                   && fut.Type == currUserTag?.Type
        );

        return (currUserTag, nextUserTag);
    }

    /// <summary>
    ///     Rename the current finance user tag by inserting new finance record tags with
    ///     the next name and deleting finance record tags with the current name.
    /// </summary>
    /// <param name="currUserTag"></param>
    /// <param name="db"></param>
    /// <param name="financeUserTagId"></param>
    /// <param name="nextUserTag"></param>
    /// <param name="cancellationToken"></param>
    private static async Task RenameAsync(
        FinanceUserTag currUserTag,
        ApiDbContext db,
        int financeUserTagId,
        FinanceUserTag nextUserTag,
        CancellationToken cancellationToken)
    {
        var financeRecordIdsWithCurrTag = await db.FinanceRecordTags
            // Filter out finance record IDs without the current tag.
            //
            // WHERE EXISTS (
            //   SELECT 1
            //   FROM finance_record_tags sqFrt -- sq == subquery
            //   JOIN finance_records fr ON fr.id = sqFrt.finance_record_id
            //   WHERE sqFrt.finance_record_id = frt.finance_record_id
            //     AND sqFrt.tag_id = $currUserTag.Id
            //     AND sqFrt.user_id = $currUserTag.UserId
            //     AND sqFrt.finance_record.type = $currUserTag.Type
            // )
            .Where(frt =>
                db.FinanceRecordTags
                    .Include(sqFrt => sqFrt.FinanceRecord)
                    .Any(sqFrt => sqFrt.FinanceRecordId == frt.FinanceRecordId
                                  && sqFrt.TagId == currUserTag.TagId
                                  && sqFrt.FinanceRecord.Type == currUserTag.Type
                                  && sqFrt.FinanceRecord.UserId == currUserTag.UserId
                    )
            )
            // After the above query, we're left with finance record IDs associated with the current
            // finance user tag. Now, we filter out other tags that aren't currUserTag and nextUserTag.
            .Where(frt => frt.TagId == currUserTag.TagId || frt.TagId == nextUserTag.TagId)
            .GroupBy(frt => frt.FinanceRecordId)
            .Select(g => new
            {
                FinanceRecordId = g.Key,
                // Each group will contain currUserTag and _might_ have nextUserTag.
                HasNextTag = g.Count() == 2
            })
            .ToListAsync(cancellationToken);

        List<int> financeRecordIdsToUnassociate = [];
        foreach (var group in financeRecordIdsWithCurrTag)
        {
            financeRecordIdsToUnassociate.Add(group.FinanceRecordId);

            if (!group.HasNextTag)
            {
                db.Add(new FinanceRecordTag
                {
                    FinanceRecordId = group.FinanceRecordId,
                    TagId = nextUserTag.TagId
                });
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        await db.FinanceRecordTags
            .Where(frt => financeRecordIdsToUnassociate.Contains(frt.FinanceRecordId))
            .Where(frt => frt.TagId == currUserTag.TagId)
            .ExecuteDeleteAsync(cancellationToken);

        await db.FinanceUserTags.Where(fut => fut.Id == financeUserTagId).ExecuteDeleteAsync(cancellationToken);
    }
}
