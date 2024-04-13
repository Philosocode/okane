using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore.ChangeTracking;
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

public class PostFinanceRecord : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapPost("", HandleAsync)
            .WithName(FinanceRecordEndpointNames.PostFinanceRecord)
            .WithSummary("Create a finance record.")
            .WithRequestValidation<Request>();
    }

    public record Request(decimal Amount, string Description, DateTime HappenedAt);

    public class RequestValidator : AbstractValidator<Request>
    {
        public RequestValidator()
        {
            RuleFor(r => r.Amount).GreaterThan(0);
            RuleFor(r => r.Description).NotEmpty().MaximumLength(DbConstants.MaxStringLength);
            RuleFor(r => r.HappenedAt).NotEmpty();
        }
    }

    private static async Task<CreatedAtRoute<ApiResponse<FinanceRecordResponse>>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            Request request,
            CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();
        var financeRecord = new FinanceRecord
        {
            Amount = request.Amount,
            Description = request.Description,
            HappenedAt = request.HappenedAt,
            UserId = userId
        };

        EntityEntry<FinanceRecord> createdRecord = await db.FinanceRecords.AddAsync(financeRecord, cancellationToken);
        var response = new ApiResponse<FinanceRecordResponse>(createdRecord.Entity.ToFinanceRecordResponse());

        return TypedResults.CreatedAtRoute(
            response,
            FinanceRecordEndpointNames.PostFinanceRecord,
            new { id = createdRecord.Entity.Id }
        );
    }
}
