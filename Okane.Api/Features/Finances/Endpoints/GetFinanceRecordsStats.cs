using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Services;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;

namespace Okane.Api.Features.Finances.Endpoints;

public class GetFinanceRecordsStats : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapGet("/stats", HandleAsync)
            .WithName(FinanceRecordEndpointNames.GetFinanceRecordsStats)
            .WithSummary("Get stats for finance records matching the given search criteria.");
    }

    private record StatsByType(FinanceRecordType Type, int Count, decimal Sum);

    private static async Task<Results<Ok<ApiResponse<FinanceRecordsStats>>, ValidationProblem>>
        HandleAsync(
        ClaimsPrincipal claimsPrincipal,
        HttpContext context,
        ApiDbContext db,
        IFinanceRecordService financeRecordService,
        [AsParameters] FinanceRecordFilterQueryParameters filterParameters,
        IValidator<FinanceRecordFilterQueryParameters> filterParametersValidator,
        CancellationToken cancellationToken)
    {
        var validationResult = await filterParametersValidator.ValidateAsync(filterParameters, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.ValidationProblem(validationResult.ToDictionary());
        }

        var userId = claimsPrincipal.GetUserId();
        var query = financeRecordService.FilterQueryableFinanceRecords(
            db.FinanceRecords.AsNoTracking(),
            filterParameters,
            userId
        );

        var stats = new FinanceRecordsStats();
        var statsByTypes = await query.GroupBy(fr => fr.Type).Select(g => new StatsByType(
            g.Key,
            g.Count(),
            g.Sum(fr => fr.Amount)
        )).ToListAsync(cancellationToken);

        foreach (var statsByType in statsByTypes)
        {
            if (statsByType.Type == FinanceRecordType.Revenue)
            {
                stats.RevenueRecords = statsByType.Count;
                stats.TotalRevenue = statsByType.Sum;
            }
            else
            {
                stats.ExpenseRecords = statsByType.Count;
                stats.TotalExpenses = statsByType.Sum;
            }
        }

        return TypedResults.Ok(new ApiResponse<FinanceRecordsStats>(stats));
    }
}
