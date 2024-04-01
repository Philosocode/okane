namespace Okane.Api.Features.Auth.Dtos.Responses;

public record UserResponse
{
    public required string Id { get; init; } = string.Empty;
    public string? Email { get; init; } = string.Empty;
    public required string Name { get; init; } = string.Empty;
}
