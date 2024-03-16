namespace Okane.Api.Features.Auth.Dtos.Responses;

public record LoginResponse
{
    public required string Email { get; set; }
    public required string Name { get; set; }
    public required string JwtToken { get; set; }
}
