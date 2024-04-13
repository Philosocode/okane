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
using Okane.Api.Infrastructure.Database.Constants;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;

namespace Okane.Api.Features.Finances.Endpoints;

public class PatchFinanceRecord : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPost("/{financeRecordId:int}", HandleAsync)
            .WithName(FinanceRecordEndpointNames.PatchFinanceRecord)
            .WithSummary("Update a finance record.")
            .WithRequestValidation<Request>();
    }

    public record Request(decimal? Amount, string? Description, DateTime? HappenedAt);

    public class RequestValidator : AbstractValidator<Request>
    {
        public RequestValidator()
        {
            RuleFor(r => r.Amount)
                .GreaterThan(0)
                .When(r => r.Amount != null);

            RuleFor(r => r.Description)
                .NotEmpty()
                .MaximumLength(DbConstants.MaxStringLength)
                .When(r => r.Description != null);

            RuleFor(r => r.HappenedAt)
                .NotEmpty()
                .When(r => r.HappenedAt != null);
        }
    }

    private static async Task<Results<Ok<ApiResponse<FinanceRecordResponse>>, NotFound>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            int financeRecordId,
            Request request,
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

        await db.SaveChangesAsync(cancellationToken);

        var response = new ApiResponse<FinanceRecordResponse>(financeRecord.ToFinanceRecordResponse());
        return TypedResults.Ok(response);
    }
}
