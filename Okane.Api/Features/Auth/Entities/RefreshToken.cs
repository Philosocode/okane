using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Okane.Api.Features.Auth.Entities;

[Index(nameof(Token), IsUnique = true)]
public class RefreshToken
{
    public int RefreshTokenId { get; set; }
    
    [MaxLength(100)]
    public required string Token { get; set; }
    public required DateTime ExpiresAt { get; set; }
    public required DateTime CreatedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    
    // Navigation.
    [Required]
    public ApiUser ApiUser { get; set; } = default!;
    
    // Computed.
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt != null;
    public bool IsActive => !IsExpired && !IsRevoked;
}
