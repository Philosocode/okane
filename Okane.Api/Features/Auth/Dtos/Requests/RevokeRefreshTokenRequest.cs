namespace Okane.Api.Features.Auth.Dtos.Requests;

public record RevokeRefreshTokenRequest
{
    public required string RefreshToken { get; set; }
}
