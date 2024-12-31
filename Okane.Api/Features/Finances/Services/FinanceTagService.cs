using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Finances.Extensions;
using Okane.Api.Features.Tags.Entities;
using Okane.Api.Infrastructure.Database;

namespace Okane.Api.Features.Finances.Services;

public interface IFinanceTagService
{
    /// <summary>
    ///     Create a finance user tag. The tag will also be created if it doesn't already exist.
    /// </summary>
    /// <returns></returns>
    Task<FinanceUserTag> CreateFinanceUserTagAsync(
        string tagName,
        FinanceRecordType type,
        string userId,
        CancellationToken cancellationToken
    );

    /// <summary>
    ///     Associate a finance record with a list of tag IDs. Tags not in financeRecord.Tags will
    ///     be created. Tags not included in tagIds will be removed.
    /// </summary>
    /// <param name="desiredTagIds"></param>
    /// <param name="financeRecord"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    Task SyncFinanceRecordTagsAsync(
        IList<int> desiredTagIds,
        FinanceRecord financeRecord,
        CancellationToken cancellationToken);

    /// <summary>
    ///     Check if the user is allowed to associate a list of tags with a finance record.
    /// </summary>
    /// <param name="tagIds"></param>
    /// <param name="type"></param>
    /// <param name="userId"></param>
    /// <param name="cancellationToken"></param>
    /// <returns>True if there's an associated finance user tag for each tag. Else false.</returns>
    Task<bool> ValidateRequestTagsAsync(
        IList<int> tagIds,
        FinanceRecordType type,
        string userId,
        CancellationToken cancellationToken
    );
}

public class FinanceTagService(ApiDbContext db) : IFinanceTagService
{
    public async Task<FinanceUserTag> CreateFinanceUserTagAsync(
        string tagName,
        FinanceRecordType type,
        string userId,
        CancellationToken cancellationToken)
    {
        var tag = await db.Tags.SingleOrDefaultAsync(t => t.Name.Equals(tagName), cancellationToken);
        if (tag is null)
        {
            tag = new Tag { Name = tagName.ToLower() };
            db.Add(tag);
            await db.SaveChangesAsync(cancellationToken);
        }

        var userTag = new FinanceUserTag
        {
            UserId = userId,
            TagId = tag.Id,
            Type = type
        };

        db.Add(userTag);
        await db.SaveChangesAsync(cancellationToken);

        userTag.Tag = tag;

        return userTag;
    }

    public async Task SyncFinanceRecordTagsAsync(
        IList<int> desiredTagIds,
        FinanceRecord financeRecord,
        CancellationToken cancellationToken)
    {
        var currTagIds = new HashSet<int>(financeRecord.Tags.Select(t => t.Id).ToList());

        var desiredTags = await db.Tags
            .Where(t => desiredTagIds.Contains(t.Id))
            .ToDictionaryAsync(
                t => t.Id, t => t,
                cancellationToken
            );

        // Add desired tags that aren't already associated with the finance record.
        foreach (var (desiredTagId, desiredTag) in desiredTags)
        {
            if (!currTagIds.Contains(desiredTagId))
            {
                financeRecord.Tags.Add(desiredTag);
            }
        }

        // Remove tags that are currently associated with the finance record but aren't included
        // in desiredTagIds.
        var tagsToRemove = financeRecord.Tags.Where(t => !desiredTags.ContainsKey(t.Id)).ToList();
        foreach (var tagToRemove in tagsToRemove)
        {
            financeRecord.Tags.Remove(tagToRemove);
        }

        await db.SaveChangesAsync(cancellationToken);

        financeRecord.SortTags();
    }

    public async Task<bool> ValidateRequestTagsAsync(
        IList<int> tagIds,
        FinanceRecordType type,
        string userId,
        CancellationToken cancellationToken)
    {
        if (tagIds.Count == 0)
        {
            return true;
        }

        var userTags = await db.FinanceUserTags
            .AsNoTracking()
            .Where(fut => fut.UserId == userId)
            .Where(fut => fut.Type == type)
            .ToDictionaryAsync(fut => fut.TagId, _ => true, cancellationToken);

        foreach (var tagId in tagIds)
        {
            if (!userTags.ContainsKey(tagId))
            {
                return false;
            }
        }

        return true;
    }
}
