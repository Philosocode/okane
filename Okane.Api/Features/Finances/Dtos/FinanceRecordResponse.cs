namespace Okane.Api.Features.Finances.Dtos;

public class FinanceRecordResponse
{
    public required int Id { get; init; }
    public required decimal Amount { get; init; }
    public required string Description { get; init; }
    public required DateTime HappenedAt { get; init; }
}
