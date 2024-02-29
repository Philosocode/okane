namespace Okane.Api.Features.Auth.Dtos.Responses;

public record UserResponse
{
    public required string Email { get; set; }
    public required string Name { get; set; }
}
