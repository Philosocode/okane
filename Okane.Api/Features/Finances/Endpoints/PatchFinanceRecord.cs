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
using Okane.Api.Features.Finances.Validators;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;

namespace Okane.Api.Features.Finances.Endpoints;

public class PatchFinanceRecord : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPatch("/{financeRecordId:int}", HandleAsync)
            .WithName(FinanceRecordEndpointNames.PatchFinanceRecord)
            .WithSummary("Update a finance record.");
    }

    public record Request(
        decimal? Amount,
        string? Description,
        DateTime? HappenedAt,
        IList<int>? TagIds,
        FinanceRecordType? Type
    );

    private static async Task<Results<Ok<ApiResponse<FinanceRecordResponse>>, NotFound, ValidationProblem>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            int financeRecordId,
            ILogger<PatchFinanceRecord> logger,
            Request request,
            IFinanceTagService tagService,
            IValidator<FinanceRecord> validator,
            CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();
        var financeRecord = await db.FinanceRecords
            .Include(fr => fr.Tags)
            .SingleOrDefaultAsync(
                r => r.UserId == userId && r.Id == financeRecordId,
                cancellationToken
            );

        if (financeRecord is null)
        {
            return TypedResults.NotFound();
        }

        if (request.Amount.HasValue)
        {
            financeRecord.Amount = request.Amount.Value;
        }

        if (request.Description is not null)
        {
            financeRecord.Description = request.Description;
        }

        if (request.HappenedAt.HasValue)
        {
            financeRecord.HappenedAt = request.HappenedAt.Value;
        }

        var tagsAreValid = true;
        if (request.TagIds is not null)
        {
            tagsAreValid = await tagService.ValidateRequestTagsAsync(
                request.TagIds,
                financeRecord.Type,
                userId,
                cancellationToken
            );
        }

        if (request.Type.HasValue)
        {
            financeRecord.Type = request.Type.Value;
        }

        var validationResult = await validator.ValidateAsync(financeRecord, cancellationToken);
        var validationErrors = validationResult.ToDictionary();
        if (!tagsAreValid)
        {
            validationErrors["Tags"] = [FinanceRecordValidator.InvalidTagsMessage];
        }

        if (!validationResult.IsValid || !tagsAreValid)
        {
            return TypedResults.ValidationProblem(validationErrors);
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            if (request.TagIds is not null)
            {
                await tagService.SyncFinanceRecordTagsAsync(request.TagIds, financeRecord, cancellationToken);
            }

            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);

            logger.LogWarning(
                "Transaction error {FinanceRecordId}: {Error}",
                financeRecord.Id, ex.Message
            );

            throw;
        }

        var response = new ApiResponse<FinanceRecordResponse>(financeRecord.ToFinanceRecordResponse());
        return TypedResults.Ok(response);
    }
}
