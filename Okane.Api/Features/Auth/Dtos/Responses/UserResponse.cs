namespace Okane.Api.Features.Auth.Dtos.Responses;

public record UserResponse
{
    public string? Email { get; init; } = string.Empty;
    public required string Name { get; init; }
}
