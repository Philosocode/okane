namespace Okane.Api.Features.Finances.Dtos;

public class FinanceRecordCursorQueryParameters
{
    public int? CursorId { get; set; }

    // One of CursorAmount and CursorHappenedAt should be passed, but not both.
    public int? CursorAmount { get; set; }
    public DateTime? CursorHappenedAt { get; set; }
}
