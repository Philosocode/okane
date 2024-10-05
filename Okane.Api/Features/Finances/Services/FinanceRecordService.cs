using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Shared.Constants;
using Okane.Api.Shared.Extensions;

namespace Okane.Api.Features.Finances.Services;

public interface IFinanceRecordService
{
    /// <summary>
    ///     Filter a finance records query with the given parameters.
    /// </summary>
    /// <param name="query"></param>
    /// <param name="parameters"></param>
    /// <param name="userId"></param>
    /// <returns></returns>
    IQueryable<FinanceRecord> FilterQueryableFinanceRecords(
        IQueryable<FinanceRecord> query,
        FinanceRecordFilterQueryParameters parameters,
        string userId
    );

    /// <summary>
    ///     Sort a finance records query with the given parameters.
    /// </summary>
    IQueryable<FinanceRecord> SortQueryableFinanceRecords(
        IQueryable<FinanceRecord> query,
        FinanceRecordSortQueryParameters parameters
    );
}

public class FinanceRecordService : IFinanceRecordService
{
    public IQueryable<FinanceRecord> FilterQueryableFinanceRecords(
        IQueryable<FinanceRecord> query,
        FinanceRecordFilterQueryParameters parameters,
        string userId)
    {
        query = query.Where(fr => fr.UserId == userId);

        if (parameters.Description is not null)
        {
            // TODO(70) Use tsvector.
            query = query.Where(
                r => EF.Functions.ILike(r.Description, $"%{parameters.Description}%")
            );
        }

        if (parameters.HappenedBefore is not null)
        {
            query = query.Where(r => r.HappenedAt <= parameters.HappenedBefore.Value.ToUniversalTime());
        }

        if (parameters.HappenedAfter is not null)
        {
            query = query.Where(r => r.HappenedAt >= parameters.HappenedAfter.Value.ToUniversalTime());
        }

        if (parameters.MinAmount is not null)
        {
            query = query.Where(r => r.Amount >= parameters.MinAmount);
        }

        if (parameters.MaxAmount is not null)
        {
            query = query.Where(r => r.Amount <= parameters.MaxAmount);
        }

        if (parameters.Type is not null)
        {
            query = query.Where(r => r.Type == parameters.Type);
        }

        return query;
    }

    public IQueryable<FinanceRecord> SortQueryableFinanceRecords(
        IQueryable<FinanceRecord> query,
        FinanceRecordSortQueryParameters parameters)
    {
        // Default to sorting by happenedAt descending.
        var sortField = parameters.SortField ?? FinanceRecordSortFields.HappenedAt;

        var isAscending = false;
        if (parameters.SortDirection is not null)
        {
            isAscending = parameters.SortDirection.Equals(SortDirections.Asc, StringComparison.OrdinalIgnoreCase);
        }

        // ALso sort by ID to ensure records with the same amounts / happenedAts are returned
        // in a consistent order.
        if (sortField.Equals(FinanceRecordSortFields.Amount, StringComparison.OrdinalIgnoreCase))
        {
            query = query
                .OrderBySortDirection(r => r.Amount, isAscending)
                .ThenBySortDirection(r => r.Id, isAscending);
        }

        if (sortField.Equals(FinanceRecordSortFields.HappenedAt, StringComparison.OrdinalIgnoreCase))
        {
            query = query
                .OrderBySortDirection(r => r.HappenedAt, isAscending)
                .ThenBySortDirection(r => r.Id, isAscending);
        }

        return query;
    }
}
