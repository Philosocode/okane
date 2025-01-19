using System.Collections;
using Okane.Api.Shared.Validators;

namespace Okane.Api.Tests.Testing.TestData;

public class InvalidPageQueryParameters : IEnumerable<object[]>
{
    private readonly List<object[]> _data =
    [
        new object[]
        {
            "pageSize=0",
            new Dictionary<string, string[]>
            {
                { "PageSize", [PageQueryParametersValidator.InvalidPageSizeError] }
            }
        }
    ];

    public IEnumerator<object[]> GetEnumerator()
    {
        return _data.GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}
