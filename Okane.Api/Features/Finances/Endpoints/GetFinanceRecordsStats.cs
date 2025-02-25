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
using Okane.Api.Shared.Constants;
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

    private static async Task<Results<Ok<ApiResponse<FinanceRecordsStats>>, ValidationProblem>>
        HandleAsync(
            ClaimsPrincipal claimsPrincipal,
            HttpContext context,
            ApiDbContext db,
            IFinanceRecordService financeRecordService,
            [AsParameters] FinanceRecordFilterQueryParameters filterParameters,
            IValidator<FinanceRecordFilterQueryParameters> filterParametersValidator,
            [AsParameters] FinanceRecordsStatsQueryParameters statsParameters,
            IValidator<FinanceRecordsStatsQueryParameters> statsParametersValidator,
            CancellationToken cancellationToken)
    {
        var validationErrors = await ValidateQueryParameters(
            filterParameters, filterParametersValidator,
            statsParameters, statsParametersValidator,
            cancellationToken
        );
        if (validationErrors is not null)
        {
            return TypedResults.ValidationProblem(validationErrors.ToDictionary());
        }

        var userId = claimsPrincipal.GetUserId();
        var allDateStats = await QueryGroupedStats(
            db,
            financeRecordService,
            filterParameters,
            statsParameters.TimeInterval,
            userId,
            cancellationToken
        );

        var stats = AggregateDateStats(allDateStats, statsParameters.TimeInterval);

        return TypedResults.Ok(new ApiResponse<FinanceRecordsStats>(stats));
    }

    private static async Task<IDictionary<string, string[]>?> ValidateQueryParameters(
        FinanceRecordFilterQueryParameters filterParameters,
        IValidator<FinanceRecordFilterQueryParameters> filterParametersValidator,
        FinanceRecordsStatsQueryParameters statsParameters,
        IValidator<FinanceRecordsStatsQueryParameters> statsParametersValidator,
        CancellationToken cancellationToken
    )
    {
        var validationResult = await filterParametersValidator.ValidateAsync(filterParameters, cancellationToken);
        if (!validationResult.IsValid)
        {
            return validationResult.ToDictionary();
        }

        validationResult = await statsParametersValidator.ValidateAsync(statsParameters, cancellationToken);
        if (!validationResult.IsValid)
        {
            return validationResult.ToDictionary();
        }

        return null;
    }

    // Aggregated stats for a particular date + type combination.
    private record DateStats(decimal Amount, int Count, DateTime Date, FinanceRecordType Type);

    /// <summary>
    ///     Query finance records based on the given filter parameters and then calculate stats,
    ///     grouping finance records based on the provided time interval.
    /// </summary>
    /// <param name="db"></param>
    /// <param name="financeRecordService"></param>
    /// <param name="filterParameters"></param>
    /// <param name="timeInterval"></param>
    /// <param name="userId"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    private static async Task<IList<DateStats>> QueryGroupedStats(
        ApiDbContext db,
        IFinanceRecordService financeRecordService,
        FinanceRecordFilterQueryParameters filterParameters,
        string timeInterval,
        string userId,
        CancellationToken cancellationToken)
    {
        var filteredFinanceRecords = financeRecordService.FilterQueryableFinanceRecords(
            db.FinanceRecords.AsNoTracking(),
            filterParameters,
            userId
        );

        // Each item in the results list contains combined stats for date + type combinations.
        // Results are ordered from earliest to latest HappenedAt, Expense before Revenue.
        // e.g. [
        //      { Amount = 1.11, Count = 1, Date = 2024/01/01, Type = Expense },
        //      { Amount = 2.22, Count = 2, Date = 2024/01/01, Type = Revenue },
        // ]
        var results = await filteredFinanceRecords
            .GroupBy(fr => new
            {
                Date = ApiDbContext.DateTrunc(timeInterval, fr.HappenedAt),
                fr.Type
            })
            .OrderBy(g => g.Key.Date)
            .ThenBy(g => g.Key.Type)
            .Select(g => new DateStats(
                g.Sum(fr => fr.Amount),
                g.Count(),
                g.Key.Date,
                g.Key.Type
            ))
            .ToListAsync(cancellationToken);

        return results;
    }

    /// <summary>
    ///     Calculate expenses and revenues from the earliest date to the latest date, incrementing by
    ///     the given time interval.
    /// </summary>
    /// <param name="allDateStats"></param>
    /// <param name="timeInterval"></param>
    /// <returns></returns>
    private static FinanceRecordsStats AggregateDateStats(IList<DateStats> allDateStats, string timeInterval)
    {
        if (allDateStats.Count == 0)
        {
            return new FinanceRecordsStats();
        }

        // Idea: start from the earliest date and increment by the interval until we've reached
        // the latest date.
        var currDate = allDateStats[0].Date;
        var stats = new FinanceRecordsStats
        {
            Dates = [currDate],
            ExpensesByDate = [0],
            RevenuesByDate = [0]
        };

        var i = 0;
        while (i < allDateStats.Count && currDate <= allDateStats[^1].Date)
        {
            // The current data is for a different date. Increment by the time interval and try again.
            var dateStats = allDateStats[i];
            var sameDay = currDate.Year == dateStats.Date.Year
                          && currDate.Month == dateStats.Date.Month
                          && currDate.Day == dateStats.Date.Day;
            if (!sameDay)
            {
                stats.ExpensesByDate.Add(0);
                stats.RevenuesByDate.Add(0);

                currDate = IncrementDateTimeByInterval(currDate, timeInterval);
                stats.Dates.Add(currDate);

                continue;
            }

            // Otherwise, we have data for currDate (expenses or revenues).
            if (dateStats.Type.Equals(FinanceRecordType.Expense))
            {
                stats.ExpenseRecords += dateStats.Count;
                stats.TotalExpenses += dateStats.Amount;
                stats.ExpensesByDate[^1] = dateStats.Amount;
            }
            else
            {
                stats.RevenueRecords += dateStats.Count;
                stats.TotalRevenues += dateStats.Amount;
                stats.RevenuesByDate[^1] = dateStats.Amount;
            }

            i++;
        }

        return stats;
    }

    /// <summary>
    ///     Increment a DateTime based on the given time interval.
    /// </summary>
    /// <param name="dateTime"></param>
    /// <param name="timeInterval"></param>
    /// <returns>New DateTime with appropriate amount of time added.</returns>
    /// <exception cref="InvalidOperationException"></exception>
    private static DateTime IncrementDateTimeByInterval(DateTime dateTime, string timeInterval)
    {
        return timeInterval switch
        {
            TimeIntervals.Day => dateTime.AddDays(1),
            TimeIntervals.Week => dateTime.AddDays(7),
            TimeIntervals.Month => dateTime.AddMonths(1),
            TimeIntervals.Year => dateTime.AddYears(1),
            _ => throw new InvalidOperationException($"Interval {timeInterval} is invalid.")
        };
    }
}
