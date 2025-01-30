using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Infrastructure.Database;

namespace Okane.Api.Features.Finances.Services;

public interface IFinanceRecordService
{
    /// <summary>
    ///     Filter a finance records query with the given parameters.
    /// </summary>
    IQueryable<FinanceRecord> FilterQueryableFinanceRecords(
        IQueryable<FinanceRecord> query,
        FinanceRecordFilterQueryParameters parameters,
        string userId
    );
}

public class FinanceRecordService(ApiDbContext db) : IFinanceRecordService
{
    public IQueryable<FinanceRecord> FilterQueryableFinanceRecords(
        IQueryable<FinanceRecord> query,
        FinanceRecordFilterQueryParameters parameters,
        string userId)
    {
        query = query.Where(fr => fr.UserId == userId);

        if (parameters.Description is not null)
        {
            query = query.Where(fr => fr.SearchVector.Matches(parameters.Description));
        }

        if (parameters.HappenedBefore is not null)
        {
            query = query.Where(fr => fr.HappenedAt <= parameters.HappenedBefore.Value.ToUniversalTime());
        }

        if (parameters.HappenedAfter is not null)
        {
            query = query.Where(fr => fr.HappenedAt >= parameters.HappenedAfter.Value.ToUniversalTime());
        }

        if (parameters.MinAmount is not null)
        {
            query = query.Where(fr => fr.Amount >= parameters.MinAmount);
        }

        if (parameters.MaxAmount is not null)
        {
            query = query.Where(fr => fr.Amount <= parameters.MaxAmount);
        }

        if (parameters.TagIds?.Length > 0)
        {
            query = query.Where(
                fr => db.FinanceRecordTags.Any(
                    frt => frt.FinanceRecordId == fr.Id && parameters.TagIds.Contains(frt.TagId)
                )
            );
        }

        if (parameters.Type is not null)
        {
            query = query.Where(fr => fr.Type == parameters.Type);
        }

        return query;
    }
}
