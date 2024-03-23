using Microsoft.EntityFrameworkCore;
using Okane.Api.Infrastructure.Database.Entities;

namespace Okane.Api.Features.Auth.Entities;

[Index(nameof(Token), IsUnique = true)]
public class RefreshToken : IOwnedEntity
{
    public int Id { get; set; }
    public required string Token { get; set; }
    public required DateTime ExpiresAt { get; set; }
    public required DateTime CreatedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    
    // Navigation.
    public string UserId { get; set; } = string.Empty;
    public ApiUser User { get; set; } = default!;
    
    // Computed.
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt != null;
    public bool IsActive => !IsExpired && !IsRevoked;
}
