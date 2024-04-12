using System.ComponentModel.DataAnnotations;
using Okane.Api.Features.Auth.Entities;
using Okane.Api.Infrastructure.Database.Entities;

namespace Okane.Api.Features.Finances.Entities;

public class FinanceRecord : IOwnedEntity
{
    public int Id { get; set; }

    public required decimal Amount { get; set; }

    [MaxLength(256)]
    public required string Description { get; set; }

    public required DateTime HappenedAt { get; set; }

    // Navigation.
    public string UserId { get; set; } = string.Empty;
    public ApiUser User { get; set; } = default!;
}
