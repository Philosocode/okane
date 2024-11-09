namespace Okane.Api.Features.Auth.Dtos.Responses;

public record PasswordRequirementsResponse
{
    public int MinLength { get; set; }
    public bool RequireDigit { get; set; }
    public bool RequireLowercase { get; set; }
    public bool RequireUppercase { get; set; }
    public bool RequireNonAlphanumeric { get; set; }
}
