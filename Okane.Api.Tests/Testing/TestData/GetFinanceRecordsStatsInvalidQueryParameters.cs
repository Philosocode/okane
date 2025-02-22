using System.Collections;
using Okane.Api.Features.Finances.Validators;

namespace Okane.Api.Tests.Testing.TestData;

public class GetFinanceRecordsStatsInvalidQueryParameters : IEnumerable<object[]>
{
    private readonly List<object[]> _data =
    [
        new object[]
        {
            "timeInterval=invalid",
            new Dictionary<string, string[]>
            {
                { "TimeInterval", [FinanceRecordStatsQueryParametersValidator.InvalidIntervalError] }
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
