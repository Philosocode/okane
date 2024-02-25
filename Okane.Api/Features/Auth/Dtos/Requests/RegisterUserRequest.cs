using System.ComponentModel.DataAnnotations;

namespace Okane.Api.Features.Auth.Dtos.Requests;

/// <summary>
/// DTO for registering a user.
/// </summary>
public record RegisterRequest
{
    [Required]
    public string Name { get; set; }
    
    [Required]
    public string Email { get; set; }
    
    [Required]
    public string Password { get; set; }
}
