namespace Okane.Api.Features.Auth.Dtos.Requests;

public record RevokeRefreshTokenRequest
{
    public string? RefreshToken { get; set; }
}
