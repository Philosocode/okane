using System.Collections;
using Okane.Api.Features.Finances.Validators;

namespace Okane.Api.Tests.Testing.TestData;

public class GetFinanceRecordsInvalidSortQueryParameters : IEnumerable<object[]>
{
    private readonly List<object[]> _data =
    [
        new object[]
        {
            "sortDirection=blah",
            new Dictionary<string, string[]>
            {
                { "SortDirection", [FinanceRecordSortQueryParametersValidator.InvalidSortDirectionError] }
            }
        },
        new object[]
        {
            "sortField=blah",
            new Dictionary<string, string[]>
            {
                { "SortField", [FinanceRecordSortQueryParametersValidator.InvalidSortFieldError] }
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
