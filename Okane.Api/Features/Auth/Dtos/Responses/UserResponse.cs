namespace Okane.Api.Features.Auth.Dtos.Responses;

public record UserResponse
{
    public string? Email { get; set; }
    public required string Name { get; set; }
}
