using Okane.Api.Shared.Wrappers.GuidGenerator;

namespace Okane.Api.Tests.Tests.Mocks.Wrappers;

public class TestingGuidGenerator(IList<Guid> guids) : IGuidGenerator
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
}
