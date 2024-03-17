using System.ComponentModel.DataAnnotations;

namespace Okane.Api.Features.Auth.Dtos.Requests;

public record RegisterRequest
{
    [Required]
    public required string Name { get; set; }
    
    [EmailAddress]
    public required string Email { get; set; }
    
    [Required]
    public required string Password { get; set; }
}
