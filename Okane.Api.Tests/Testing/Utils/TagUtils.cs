using Okane.Api.Features.Tags.Entities;
using Okane.Api.Infrastructure.Database;
using Okane.Api.Tests.Testing.StubFactories;

namespace Okane.Api.Tests.Testing.Utils;

public static class TagUtils
{
    public static async Task<IList<Tag>> CreateAndSaveNTagsAsync(ApiDbContext db, int n)
    {
        var tags = TagStubFactory.CreateN(n);
        db.AddRange(tags);
        await db.SaveChangesAsync();

        return tags;
    }
}
