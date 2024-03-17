using System.Text.Json.Serialization;
using Okane.Api.Features.Auth.Entities;

namespace Okane.Api.Features.Auth.Dtos.Responses;

public record LoginResponse
{
    public required string Email { get; set; }
    public required string Name { get; set; }
    public required string JwtToken { get; set; }
    
    // The refresh token should be set on an HTTP-only cookie. It shouldn't be returned to clients.
    [JsonIgnore]
    public required RefreshToken RefreshToken { get; set; }
}
