using System.ComponentModel.DataAnnotations;

namespace Okane.Api.Features.Auth.Dtos.Requests;

public record RegisterRequest
{
    [Required]
    public required string Name { get; init; }
    
    [EmailAddress]
    public required string Email { get; init; }
    
    [Required]
    public required string Password { get; init; }
}
