using Okane.Api.Features.Tags.Entities;

namespace Okane.Api.Tests.Testing.StubFactories;

public class TagStubFactory
{
    public static IList<Tag> CreateN(int n)
    {
        var tags = new List<Tag>();

        for (var i = 1; i <= int.Max(n, 0); i++)
        {
            tags.Add(new Tag { Name = i.ToString() });
        }

        return tags;
    }
}
