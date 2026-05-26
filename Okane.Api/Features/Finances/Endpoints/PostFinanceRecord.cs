using System.Net;
using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
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

public class PostFinanceRecord : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPost("", HandleAsync)
            .WithName(FinanceRecordEndpointNames.PostFinanceRecord)
            .WithSummary("Create a finance record.");
    }

    public record Request(
        decimal Amount,
        string Description,
        DateTime HappenedAt,
        FinanceRecordType Type,
        IList<int> TagIds
    );

    private static async Task<Results<CreatedAtRoute<ApiResponse<FinanceRecordResponse>>, ValidationProblem>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            ILogger<PostFinanceRecord> logger,
            Request request,
            IFinanceTagService tagService,
            IValidator<FinanceRecord> validator,
            CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();
        var financeRecord = new FinanceRecord
        {
            Amount = request.Amount,
            Description = request.Description,
            HappenedAt = request.HappenedAt,
            Tags = [],
            Type = request.Type,
            UserId = userId
        };

        var tagsAreValid = true;
        if (request.TagIds.Count > 0)
        {
            tagsAreValid = await tagService.ValidateRequestTagsAsync(
                request.TagIds,
                financeRecord.Type,
                userId,
                cancellationToken
            );
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
            db.FinanceRecords.Add(financeRecord);
            await db.SaveChangesAsync(cancellationToken);

            if (request.TagIds.Count > 0)
            {
                await tagService.SyncFinanceRecordTagsAsync(request.TagIds, financeRecord, cancellationToken);
            }

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

        var response = new ApiResponse<FinanceRecordResponse>(financeRecord.ToFinanceRecordResponse())
        {
            Status = HttpStatusCode.Created
        };

        return TypedResults.CreatedAtRoute(
            response,
            FinanceRecordEndpointNames.GetFinanceRecord,
            new { financeRecordId = financeRecord.Id }
        );
    }
}
