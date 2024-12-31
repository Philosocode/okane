using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Tags.Entities;

namespace Okane.Api.Features.Finances.Dtos;

public class FinanceRecordResponse
{
    public required int Id { get; init; }
    public required decimal Amount { get; init; }
    public required string Description { get; init; }
    public required DateTime HappenedAt { get; init; }
    public required IEnumerable<Tag> Tags { get; init; }
    public required FinanceRecordType Type { get; init; }
}
