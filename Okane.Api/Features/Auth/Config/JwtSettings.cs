namespace Okane.Api.Features.Auth.Config;

public record JwtSettings
{
    public string Audience { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string IssuerSigningKey { get; set; } = string.Empty;
    public int MinutesToExpiration { get; set; } = 15;
    public int RefreshTokenTtlDays { get; set; } = 3;
}
