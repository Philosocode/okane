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
using Okane.Api.Shared.Constants;
using Okane.Api.Shared.Dtos.ApiResponses;
using Okane.Api.Shared.Dtos.QueryParameters;
using Okane.Api.Shared.Extensions;

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
            [AsParameters] FinanceRecordCursorQueryParameters cursorParameters,
            IValidator<FinanceRecordCursorQueryParameters> cursorParametersValidator,
            [AsParameters] FinanceRecordFilterQueryParameters filterParameters,
            IValidator<FinanceRecordFilterQueryParameters> filterParametersValidator,
            [AsParameters] PageQueryParameters pageParameters,
            IValidator<PageQueryParameters> pageParametersValidator,
            [AsParameters] FinanceRecordSortQueryParameters sortParameters,
            IValidator<FinanceRecordSortQueryParameters> sortParametersValidator,
            CancellationToken cancellationToken)
    {
        var validationErrors = await ValidateQueryParameters(
            cursorParameters, cursorParametersValidator,
            filterParameters, filterParametersValidator,
            pageParameters, pageParametersValidator,
            sortParameters, sortParametersValidator,
            cancellationToken
        );
        if (validationErrors is not null)
        {
            return TypedResults.ValidationProblem(validationErrors);
        }

        var userId = claimsPrincipal.GetUserId();
        var isAscending = SortDirections.IsAscending(sortParameters.SortDirection);
        var sortField = sortParameters.SortField ?? "";
        var sortByAmount = cursorParameters.CursorAmount.HasValue
                           || sortField.Equals(FinanceRecordSortFields.Amount, StringComparison.OrdinalIgnoreCase);

        var query = db.FinanceRecords.AsNoTracking();
        query = financeRecordService.FilterQueryableFinanceRecords(query, filterParameters, userId);
        query = FilterByCursorQueryParameters(query, cursorParameters, isAscending);
        query = SortQuery(query, isAscending, sortByAmount);

        var response = await ApiPaginatedResponse<FinanceRecordResponse>.CreateAsync(
            query
                .Include(fr => fr.Tags.OrderBy(t => t.Name))
                .Select(fr => fr.ToFinanceRecordResponse()),
            pageParameters.PageSize
        );

        return TypedResults.Ok(response);
    }

    private static async Task<IDictionary<string, string[]>?> ValidateQueryParameters(
        [AsParameters] FinanceRecordCursorQueryParameters cursorParameters,
        IValidator<FinanceRecordCursorQueryParameters> cursorParametersValidator,
        [AsParameters] FinanceRecordFilterQueryParameters filterParameters,
        IValidator<FinanceRecordFilterQueryParameters> filterParametersValidator,
        [AsParameters] PageQueryParameters pageParameters,
        IValidator<PageQueryParameters> pageParametersValidator,
        [AsParameters] FinanceRecordSortQueryParameters sortParameters,
        IValidator<FinanceRecordSortQueryParameters> sortParametersValidator,
        CancellationToken cancellationToken
    )
    {
        var validationResult = await cursorParametersValidator.ValidateAsync(cursorParameters, cancellationToken);
        if (!validationResult.IsValid)
        {
            return validationResult.ToDictionary();
        }

        validationResult = await filterParametersValidator.ValidateAsync(filterParameters, cancellationToken);
        if (!validationResult.IsValid)
        {
            return validationResult.ToDictionary();
        }

        validationResult = await pageParametersValidator.ValidateAsync(pageParameters, cancellationToken);
        if (!validationResult.IsValid)
        {
            return validationResult.ToDictionary();
        }

        validationResult = await sortParametersValidator.ValidateAsync(sortParameters, cancellationToken);
        if (!validationResult.IsValid)
        {
            return validationResult.ToDictionary();
        }

        // Check that the sort field matches the cursor field. We don't infer the sort field based on
        // the defined cursor field because the cursor field won't be defined in the initial request.
        var usingCursor = cursorParameters.CursorId.HasValue && (
            cursorParameters.CursorAmount.HasValue || cursorParameters.CursorHappenedAt.HasValue
        );
        var sortField = sortParameters.SortField ?? "";
        if (usingCursor && sortField != "")
        {
            return new Dictionary<string, string[]>
            {
                { "SortField", [FinanceRecordCursorQueryParametersValidator.CursorSortFieldError] }
            };
        }

        return null;
    }

    private static IQueryable<FinanceRecord> FilterByCursorQueryParameters(
        IQueryable<FinanceRecord> query,
        FinanceRecordCursorQueryParameters cursorParameters,
        bool isAscending)
    {
        if (cursorParameters.CursorId is null)
        {
            return query;
        }

        if (cursorParameters.CursorAmount is not null)
        {
            if (isAscending)
            {
                query = query.Where(fr =>
                    fr.Amount > cursorParameters.CursorAmount
                    || (fr.Amount == cursorParameters.CursorAmount &&
                        fr.Id > cursorParameters.CursorId)
                );
            }
            else
            {
                query = query.Where(fr =>
                    fr.Amount < cursorParameters.CursorAmount
                    || (fr.Amount == cursorParameters.CursorAmount
                        && fr.Id > cursorParameters.CursorId)
                );
            }
        }
        else if (cursorParameters.CursorHappenedAt is not null)
        {
            if (isAscending)
            {
                query = query.Where(fr =>
                    fr.HappenedAt > cursorParameters.CursorHappenedAt.Value.ToUniversalTime()
                    || (fr.HappenedAt == cursorParameters.CursorHappenedAt.Value.ToUniversalTime()
                        && fr.Id > cursorParameters.CursorId)
                );
            }
            else
            {
                query = query.Where(fr =>
                    fr.HappenedAt < cursorParameters.CursorHappenedAt.Value.ToUniversalTime()
                    || (fr.HappenedAt == cursorParameters.CursorHappenedAt.Value.ToUniversalTime()
                        && fr.Id > cursorParameters.CursorId)
                );
            }
        }

        return query;
    }

    private static IQueryable<FinanceRecord> SortQuery(
        IQueryable<FinanceRecord> query,
        bool isAscending,
        bool sortByAmount)
    {
        // If multiple finance records have the same amount or happenedAt, the ID is used as a tiebreaker.

        if (sortByAmount)
        {
            return query
                .OrderBySortDirection(r => r.Amount, isAscending)
                .ThenBySortDirection(r => r.Id, true);
        }

        return query
            .OrderBySortDirection(r => r.HappenedAt, isAscending)
            .ThenBySortDirection(r => r.Id, true);
    }
}
