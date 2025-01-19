using System.Collections;
using Okane.Api.Features.Finances.Validators;

namespace Okane.Api.Tests.Testing.TestData;

public class GetFinanceRecordsInvalidFilterQueryParameters : IEnumerable<object[]>
{
    private readonly List<object[]> _data =
    [
        new object[]
        {
            "maxAmount=-1",
            new Dictionary<string, string[]>
            {
                { "MaxAmount", [FinanceRecordFilterQueryParametersValidator.MaxAmountError] }
            }
        },
        new object[]
        {
            "minAmount=-1",
            new Dictionary<string, string[]>
            {
                { "MinAmount", [FinanceRecordFilterQueryParametersValidator.MinAmountError] }
            }
        },
        new object[]
        {
            "minAmount=2&maxAmount=1",
            new Dictionary<string, string[]>
            {
                { "MaxAmount", [FinanceRecordFilterQueryParametersValidator.InvalidAmountsError] }
            }
        },
        new object[]
        {
            "happenedBefore=2025-01-01T07:00:00.000Z&happenedAfter=2025-01-02T07:00:00.000Z",
            new Dictionary<string, string[]>
            {
                { "HappenedAfter", [FinanceRecordFilterQueryParametersValidator.InvalidHappenedAtsError] }
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
