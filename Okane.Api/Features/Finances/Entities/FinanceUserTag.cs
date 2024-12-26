using Microsoft.EntityFrameworkCore;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Features.Tags.Entities;
using Okane.Api.Infrastructure.Database.Entities;

namespace Okane.Api.Features.Finances.Entities;

[Index(
    nameof(UserId), nameof(TagId), nameof(Type),
    IsUnique = true
)]
public class FinanceUserTag : IOwnedEntity
{
    public int Id { get; set; }
    public required FinanceRecordType Type { get; set; }

    // Navigation.
    public int TagId { get; set; }
    public Tag Tag { get; set; } = null!;

    public string UserId { get; set; } = string.Empty;
    public ApiUser User { get; set; } = null!;
}
