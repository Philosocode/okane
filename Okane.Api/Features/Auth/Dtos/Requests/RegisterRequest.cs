namespace Okane.Api.Features.Auth.Dtos.Requests;

public record RegisterRequest
{
    public required string Name { get; set; }
    
    public required string Email { get; set; }
    
    public required string Password { get; set; }
}
