namespace Okane.Api.Features.Auth.Dtos.Responses;

public record UserResponse
{
    public required string Id { get; init; }
    public string? Email { get; init; }
    public required bool EmailConfirmed { get; init; }
    public required string Name { get; init; }
}
