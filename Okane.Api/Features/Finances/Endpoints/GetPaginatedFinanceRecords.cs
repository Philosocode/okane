using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Extensions;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Mappers;
using Okane.Api.Features.Finances.Services;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Infrastructure.Endpoints;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Shared.Dtos.QueryParameters;

namespace Okane.Api.Features.Finances.Endpoints;

public class GetPaginatedFinanceRecords : IEndpoint
{
    public static void Map(IEndpointRouteBuilder builder)
    {
        builder
            .MapGet("", HandleAsync)
            .WithName(FinanceRecordEndpointNames.GetPaginatedFinanceRecords)
            .WithSummary("Get a paginated list of finance records.");
    }

    private static async Task<Results<Ok<ApiPaginatedResponse<FinanceRecordResponse>>, ValidationProblem>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            IFinanceRecordService financeRecordService,
            IValidator<FinanceRecordSortQueryParameters> sortParametersValidator,
            [AsParameters] FinanceRecordFilterQueryParameters filterParameters,
            [AsParameters] FinanceRecordSortQueryParameters sortParameters,
            [AsParameters] PageQueryParameters pageParameters,
            CancellationToken cancellationToken)
    {
        var userId = claimsPrincipal.GetUserId();

        var validationResult = await sortParametersValidator.ValidateAsync(sortParameters, cancellationToken);
        if (!validationResult.IsValid)
        {
            return TypedResults.ValidationProblem(validationResult.ToDictionary());
        }

        var query = db.FinanceRecords.AsNoTracking();
        query = financeRecordService.FilterQueryableFinanceRecords(query, filterParameters, userId);
        query = financeRecordService.SortQueryableFinanceRecords(query, sortParameters);

        var response = await ApiPaginatedResponse<FinanceRecordResponse>.CreateAsync(
            query
                .Include(fr => fr.Tags.OrderBy(t => t.Name))
                .Select(fr => fr.ToFinanceRecordResponse()),
            pageParameters
        );

        return TypedResults.Ok(response);
    }
}
