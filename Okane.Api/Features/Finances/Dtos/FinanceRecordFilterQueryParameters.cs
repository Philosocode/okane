using Microsoft.AspNetCore.Mvc;
using Okane.Api.Features.Finances.Entities;

namespace Okane.Api.Features.Finances.Dtos;

public class FinanceRecordFilterQueryParameters
{
    public string? Description { get; set; }

    public DateTime? HappenedBefore { get; set; }
    public DateTime? HappenedAfter { get; set; }

    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }

    [FromQuery(Name = "tagIds")]
    public int[]? TagIds { get; set; }
    public FinanceRecordType? Type { get; set; }
}
