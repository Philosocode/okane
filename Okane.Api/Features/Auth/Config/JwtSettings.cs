namespace Okane.Api.Features.Auth.Config;

public record JwtSettings
{
    public string Audience { get; init; } = string.Empty;
    public string Issuer { get; init; } = string.Empty;
    public string IssuerSigningKey { get; init; } = string.Empty;
    public int MinutesToExpiration { get; init; } = 15;
    public int RefreshTokenTtlDays { get; init; } = 14;
}
