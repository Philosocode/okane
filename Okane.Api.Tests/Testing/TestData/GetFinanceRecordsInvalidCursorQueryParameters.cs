using System.Collections;
using Okane.Api.Features.Finances.Validators;

namespace Okane.Api.Tests.Testing.TestData;

public class GetFinanceRecordsInvalidCursorQueryParameters : IEnumerable<object[]>
{
    private readonly List<object[]> _data =
    [
        new object[]
        {
            "cursorAmount=1",
            new Dictionary<string, string[]>
            {
                { "CursorId", [FinanceRecordCursorQueryParametersValidator.MissingCursorIdError] }
            }
        },
        new object[]
        {
            "cursorHappenedAt=2025-01-01T07:00:00.000Z",
            new Dictionary<string, string[]>
            {
                { "CursorId", [FinanceRecordCursorQueryParametersValidator.MissingCursorIdError] }
            }
        },
        new object[]
        {
            "cursorId=1&cursorAmount=1&cursorHappenedAt=2025-01-01T07:00:00.000Z",
            new Dictionary<string, string[]>
            {
                { "Cursor", [FinanceRecordCursorQueryParametersValidator.CursorFieldError] }
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
