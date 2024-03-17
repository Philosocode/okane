using System.Text.Json.Serialization;
using Okane.Api.Features.Auth.Entities;

namespace Okane.Api.Features.Auth.Dtos.Responses;

public record AuthenticateResponse
{
    public required UserResponse User { get; init; }
    public required string JwtToken { get; init; }
    
    // The refresh token should be set on an HTTP-only cookie. It shouldn't be returned to clients.
    [JsonIgnore]
    public required RefreshToken RefreshToken { get; init; }
}
