using Okane.Api.Features.Finances.Entities;
using Okane.Api.Features.Tags.Entities;

namespace Okane.Api.Features.Finances.Dtos;

public class FinanceUserTagResponse
{
    public required int Id { get; init; }
    public required FinanceRecordType Type { get; init; }
    public required Tag Tag { get; init; }
}
