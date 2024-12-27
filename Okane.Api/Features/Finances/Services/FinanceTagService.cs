using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Finances.Entities;
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
}
