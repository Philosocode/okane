using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Tags.Entities;
using Okane.Api.Infrastructure.Database;

namespace Okane.Api.Tests.Testing.Utils;

public static class FinanceTagUtils
{
    public static IList<FinanceUserTag> AddFinanceUserTags(
        ApiDbContext db,
        IList<Tag> tags,
        string userId,
        FinanceRecordType type = FinanceRecordType.Expense)
    {
        var userTags = new List<FinanceUserTag>();

        foreach (var tag in tags)
        {
            userTags.Add(new FinanceUserTag { TagId = tag.Id, Type = type, UserId = userId });
        }

        db.AddRange(userTags);

        return userTags;
    }
}
