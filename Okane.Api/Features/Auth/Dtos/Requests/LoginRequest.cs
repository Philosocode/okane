namespace Okane.Api.Features.Auth.Dtos.Requests;

public record LoginRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}