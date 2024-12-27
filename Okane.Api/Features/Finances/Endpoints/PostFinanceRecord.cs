using System.Net;
using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Mappers;
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

    public record Request(decimal Amount, string Description, DateTime HappenedAt, FinanceRecordType Type);

    private static async Task<Results<CreatedAtRoute<ApiResponse<FinanceRecordResponse>>, ValidationProblem>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            Request request,
            IValidator<FinanceRecord> validator,
            CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();
        var financeRecord = new FinanceRecord
        {
            Amount = request.Amount,
            Description = request.Description,
            HappenedAt = request.HappenedAt,
            Type = request.Type,
            UserId = userId
        };

        var validationResult = await validator.ValidateAsync(financeRecord, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.ValidationProblem(validationResult.ToDictionary());
        }

        await db.FinanceRecords.AddAsync(financeRecord, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);

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
