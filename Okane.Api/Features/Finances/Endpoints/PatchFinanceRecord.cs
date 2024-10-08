using System.Security.Claims;
using FluentValidation;
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

public class PatchFinanceRecord : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPatch("/{financeRecordId:int}", HandleAsync)
            .WithName(FinanceRecordEndpointNames.PatchFinanceRecord)
            .WithSummary("Update a finance record.");
    }

    public record Request(decimal? Amount, string? Description, DateTime? HappenedAt, FinanceRecordType? Type);

    private static async Task<Results<Ok<ApiResponse<FinanceRecordResponse>>, NotFound, ValidationProblem>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            int financeRecordId,
            Request request,
            IValidator<FinanceRecord> validator,
            CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();
        var financeRecord = await db.FinanceRecords
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

        if (request.Type.HasValue)
        {
            financeRecord.Type = request.Type.Value;
        }

        var validationResult = await validator.ValidateAsync(financeRecord, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.ValidationProblem(validationResult.ToDictionary());
        }

        await db.SaveChangesAsync(cancellationToken);

        var response = new ApiResponse<FinanceRecordResponse>(financeRecord.ToFinanceRecordResponse());
        return TypedResults.Ok(response);
    }
}
