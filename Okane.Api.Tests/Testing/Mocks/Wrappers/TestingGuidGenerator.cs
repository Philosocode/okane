using Ardalis.GuardClauses;
using Okane.Api.Shared.Wrappers;

namespace Okane.Api.Tests.Testing.Mocks.Wrappers;

public class TestingGuidWrapper(IList<Guid> guids) : IGuidWrapper
{
    private int _index;

    public Guid NewGuid()
    {
        Guid nextGuid = guids[_index];

        // If last guid in the list, loop around.
        if (_index == guids.Count - 1)
        {
            _index = 0;
        }
        else
        {
            _index++;
        }

        return nextGuid;
    }

    public static IList<Guid> GenerateGuidList(int n)
    {
        Guard.Against.NegativeOrZero(n);

        var guidList = new List<Guid>();
        for (var i = 0; i < n; i++)
        {
            guidList.Add(Guid.NewGuid());
        }

        return guidList;
    }
}
